import { DataConnectorInPort, DataConnectorOutPort, FlowConnectorInPort, FlowConnectorOutPort, IConnectorPort, StoryGraph } from 'storygraph';
import { StoryObject } from "../helpers/AbstractStoryObject";
import { h } from "preact";
import { MenuTemplate } from "preact-sidebar";
import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { action, makeObservable, observable } from 'mobx';
import { useContext, useRef } from 'preact/hooks';
import { Store } from '../../renderer';
import * as BABYLON from 'babylonjs';
import "babylonjs-loaders";
import { createModelSchema } from 'serializr';

class _CameraView extends StoryObject {
    public content: any;
    public childNetwork: undefined;
    public name: string;
    public role = "internal.content.cameraview";
    public isContentNode = true;
    public userDefinedProperties: any;
    public icon: string;
    
    static defaultIcon = "icon-camera";
    
    public cameraIds: string[];
    public activeCamera: string;

    constructor() {
        super();
        this.makeDefaultConnectors();

        this.name = "Camera View";
        this.icon = _CameraView.defaultIcon;
        this.content = {};
        this.activeCamera = "";
        this.cameraIds = [];

        makeObservable(this, {
            name: observable,
            content: observable.deep,
            cameraIds: observable,
            activeCamera: observable,
            updateCameraIds: action,
            updateName: action,
            getComponent: false
        });

    }

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
            ...nameField(this),
            ...dropDownField(
                this,
                () => this.cameraIds as string[],
                () => this.activeCamera,
                (selection) => this.updateActiveCamera(selection)
            ),
            ...connectionField(this),
         ];
        if (super.menuTemplate) ret.push(...super.menuTemplate);
        return ret;
    }

    public pullData(): any {
        // get parent network
        const port = this.getPort() as DataConnectorOutPort<string >;
        if (port && port.pull) return port.pull();
    }

    public updateName(name: string) {
        this.name = name;
    }

    public getComponent() {
        
        return () => {
            const canvas = useRef(null);
            const div = useRef(null);
            const elem = <canvas id={`canvas-${this.id}`}  ref={canvas} height="auto" width="auto" />;
            const elem2 = <div class="content canvas-content" id={this.id} ref={div} style="display: block; width=100%; height=100%" />;

            elem2.props["children"] = [elem];
            // const dimensions = (div.current as unknown as HTMLDivElement).getBoundingClientRect();
            // elem.props["width"] = dimensions.width;
            // elem.props["height"] = dimensions.height;

            const engine = new BABYLON.Engine(canvas.current);
            // above code works fine!
            const pixelRatio = window.devicePixelRatio;
            // Set the render engine to scale properly
            engine.setHardwareScalingLevel(1 / pixelRatio)
            const file = this.pullData() as string | undefined;
            
            if (file) {
                console.log(file)
                BABYLON.SceneLoader.ShowLoadingScreen = false;
                BABYLON.SceneLoader.LoadAsync(
                    file, "", engine
                ).then((scene: BABYLON.Scene) => {
                    // scene.debugLayer.show();
                    scene.setActiveCameraByID("Camera");

                    this.updateCameraIds(scene.cameras.map(e => e.id));
                    
                    engine.runRenderLoop(() => {
                        scene.render();
                    });

                    window.addEventListener("resize", (ev: UIEvent) => {
                        // ev.currentTarget
                        engine.resize();
                    });
                });
            }

            return this.modifiers.reduce((p, v) => (v.modify(p)), elem2);
        };
    }

    public updateCameraIds(ids: string[]) : void {
        this.cameraIds = ids;
    }

    public updateActiveCamera(selection: string) : void {
        this.activeCamera = selection;
    }

    public getEditorComponent() {
        return () => <div></div>
    }

    private getPort() {
        if (this.connections.length > 0) {
            const registry = useContext(Store).storyContentObjectRegistry;
            // get data edges for this node
            const incoming = this.connections.
                filter(edge => {
                    const [id, port]: string[] = StoryGraph.parseNodeId(edge.to);
                    return port.startsWith("data") && id === this.id;
                });
            // pull data from their scene
            if (incoming.length === 1) {
                const [id, port] = StoryGraph.parseNodeId(incoming[0].from);
                const fromNode = registry.getValue(id);
                const _port = fromNode?.connectors.get(port);

                if (_port)
                    return _port
            }
        } else return;
    }
}
createModelSchema(_CameraView, {});
export const plugInExport = exportClass(
    _CameraView,
    "Camera View",
    "internal.content.cameraview",
    _CameraView.defaultIcon,
    true
);
