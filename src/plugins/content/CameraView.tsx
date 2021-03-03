import { h } from "preact";
import * as BABYLON from 'babylonjs';
import "babylonjs-loaders";
import { createModelSchema, object } from 'serializr';
import { DropDown, MenuTemplate } from 'preact-sidebar';
import Logger from 'js-logger';
import { action, makeObservable, observable } from 'mobx';
import { useEffect, useRef } from 'preact/hooks';
import { DataConnectorInPort, StoryGraph } from 'storygraph';
import { StoryObject } from "../helpers/AbstractStoryObject";
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { rootEngine } from "../../renderer/components/App";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";

class _CameraView extends StoryObject {

    public name = "Camera View";
    public role = "internal.content.cameraview";
    public isContentNode = true;
    public userDefinedProperties: any;
    public icon: string;
    public activeCamera: string;
    static defaultIcon = "icon-camera";
    private dataInPort = new DataConnectorInPort(
        "data-in", 
        (data: BABYLON.Scene | undefined) => {
            Logger.info("received", data);
            if (this._cachedScene === undefined && this._cachedScene != data) {
                this._cachedScene = data;
                this.logger.info("reassigning _cachedScene");
                if (data.cameras.length >= 1) {
                    this.activeCamera = data.cameras[0].id;
                } else {
                    // fallback if no camera is present
                    this._cachedScene.createDefaultCamera();
                }
            }
        }
    );
    private _cachedScene: BABYLON.Scene | undefined;
    private logger = Logger.get("Camera View");
    
    public get cameraIds(): string[] {
        if (this._cachedScene !== undefined) {
            return this._cachedScene.cameras.map(cam => cam.id);
        } else {
            // try to get the scene
            this.dataInPort.connections.forEach(edge => {
                const [, portID] = StoryGraph.parseNodeId(edge.from);
                this.notificationCenter?.push(portID, {
                    type: "data-request",
                    source: this.dataInPort,
                    data: undefined
                });
            });
            return ["pending"];
        }
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new DropDown(
                "Camera",
                {
                    options: this.cameraIds
                },
                () => this.activeCamera,
                (camera) => this.updateActiveCamera(camera)
            ),
            ...connectionField(this),
         ];
        if (super.menuTemplate) ret.push(...super.menuTemplate);
        return ret;
    }

    constructor() {
        super();
        this.makeDefaultConnectors();

        this.icon = _CameraView.defaultIcon;
        this.activeCamera = "";

        makeObservable(this, {
            name: observable,
            // content: observable.deep,
            activeCamera: observable,
            updateName: action,
            cameraIds: false,
            getComponent: false
        });
    }

    public updateName(name: string) {
        this.name = name;
    }

    public getComponent() {
        
        return () => {
            const canvas = useRef<HTMLCanvasElement>();
            const div = useRef<HTMLDivElement>();

            const elem2 = <div class="content canvas-content" id={this.id} ref={div} style="display: block; width=100%; height=100%" >
                <canvas id={`canvas-${this.id}`}  ref={canvas} height="300" width="300" />
            </div>;
            
            useEffect(() => {
                // if scene is not cached locally, request it from connection
                if (this._cachedScene === undefined) {
                    this.dataInPort.connections.forEach(edge => {
                        const [,conID] = StoryGraph.parseNodeId(edge.from);
                        this.notificationCenter?.push(conID, {
                            type: "data-request",
                            source: this.dataInPort,
                            data: undefined
                        });
                    });
                }
                // this code should be executed _after_ theeee scene is loaded?
                this.logger.info("Found scene")
                if (canvas !== undefined && canvas.current != null) {
                    this.logger.info("Found canvas")
                    canvas.current.addEventListener("resize", () => {
                        this.logger.info(`Canvas resized to ${canvas.current?.getBoundingClientRect().width} and ${canvas.current?.getBoundingClientRect().width}.`)
                    });
                    // Set the render engine to scale properly
                    const pixelRatio = window.devicePixelRatio;
                    const camera = this._cachedScene.getCameraByID(this.activeCamera) ?? undefined;
                    
                    this.logger.info(`Using ${this.activeCamera} for rendering`, camera);
                    
                    rootEngine.setHardwareScalingLevel(1 / pixelRatio)
                    rootEngine.runRenderLoop(() => {
                        if (this._cachedScene) this._cachedScene.render();
                    });

                    rootEngine.registerView(
                        canvas.current,
                        camera
                    );

                    const resizeHandler = () => {
                        // ev.currentTarget
                        rootEngine.resize();
                    }

                    // window.addEventListener("resize", resizeHandler);

                    return () => {
                        if (canvas.current) rootEngine.unRegisterView(canvas.current);
                        window.removeEventListener("resize", resizeHandler);
                    }
                }
            });
            
            return this.modifiers.reduce((p, v) => (v.modify(p)), elem2);
        };
    }

    public updateActiveCamera(selection: string) : void {
        this.activeCamera = selection;
    }

    public getEditorComponent() {
        return () => <div></div>
    }

    public get connectors() {
        const sup = super.connectors;
        sup.set(this.dataInPort.id, this.dataInPort);

        return sup;
    }
}

createModelSchema(_CameraView, {
    dataInPort: object(ConnectorSchema),
    activeCamera: true
});

export const plugInExport = exportClass(
    _CameraView,
    "Camera View",
    "internal.content.cameraview",
    _CameraView.defaultIcon,
    true
);
