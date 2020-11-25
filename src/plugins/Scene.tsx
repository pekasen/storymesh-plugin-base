import { action, makeObservable, observable } from 'mobx';
import { h, FunctionComponent } from "preact";
import { IConnectorPort, StoryGraph } from 'storygraph';
import { IPlugInRegistryEntry, IMenuTemplate, INGWebSProps } from '../renderer/utils/PlugInClassRegistry';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
import { connectionField, nameField } from './helpers/plugInHelpers';
// import { GLTFFileLoader } from "babylonjs-loaders"
// import * as Three from "three";
// import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { exportClass } from './helpers/exportClass';
import { Scene } from 'babylonjs';

export interface ISceneContent {
    scene?: any
    file: string
}

class _Scene extends AbstractStoryObject {
    public content: ISceneContent;
    public childNetwork?: StoryGraph | undefined;
    public name: string;
    public role: string;
    public isContentNode = true;
    public userDefinedProperties: any;
    public connectors: IConnectorPort[];
    public menuTemplate: IMenuTemplate[];
    public icon: string;

    constructor() {
        super();

        this.name = "Scene";
        this.role = "scene";
        this.connectors = [
            {
                name: "data-out",
                type: "data",
                direction: "out",
                call: this.getScene
            }
        ];
        this.menuTemplate = [
            ...nameField(this),
            {
                label: "Scene Location",
                type: "file-selector",
                value: () => this.content.file,
                valueReference: this.updateContent
            },
            ...connectionField(this)
        ]
        this.icon = "icon-box";
        this.content = {
            // scene: undefined,
            file: ""
        };

        makeObservable(
            this, {
            connectors: observable,
            name: observable,
            updateName: action,
            content: observable,
            updateContent: action
        });
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public getComponent() {
        return () => (<p style="display: none;"></p>)
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component"></div>
    }

    public getScene() {
        // return this.content.scene;
    }

    public async updateContent(file?: string) {
        const { SceneLoader } = await import("babylonjs");
        if (file) {
            const loader = new SceneLoader.Append();
            loader.readFile(
                new Scene(),
                file,
                ( gltf ) => {
                    this.content.scene = gltf;
                },
                ( xhr ) => {
                    console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );
                },
                ( error ) => {
                    console.error(error);
                }
            );
        }
    }

    // private _readScene(path?: string) {

    // }

    // private _createMockScene() {
    //     this.content.scene.add(
    //     );
    // }
}

export const plugInExport: IPlugInRegistryEntry<AbstractStoryObject> = exportClass(
    _Scene,
    "Scene",
    "internal.content.scene",
    "icon-box",
    true
);
