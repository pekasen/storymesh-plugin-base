import { action, makeObservable, observable } from 'mobx';
import { h, FunctionComponent } from "preact";
import { IConnectorPort, StoryGraph } from 'storygraph';
import { IPlugInRegistryEntry, IMenuTemplate, INGWebSProps } from '../renderer/utils/PlugInClassRegistry';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
import { connectionField, nameField } from './helpers/plugInHelpers';

// import * as Three from "three";
// import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { exportClass } from './helpers/exportClass';

export interface ISceneContent {
    file: string
}

class _Scene extends AbstractStoryObject {
    public content: ISceneContent;
    public childNetwork?: StoryGraph | undefined;
    public name: string;
    public role: string;
    public isContentNode = true;
    public userDefinedProperties: any;
    public connectors: Map<string, IConnectorPort>;
    public menuTemplate: IMenuTemplate[];
    public icon: string;

    constructor() {
        super();

        this.name = "Scene";
        this.role = "scene";
        this.connectors = new Map<string, IConnectorPort>();
        [
            {
                name: "data-out",
                type: "data",
                direction: "out",
                call: () => this.content.file
            }
        ].forEach(e => this.connectors.set(e.name, e as IConnectorPort));
        this.menuTemplate = [
            ...nameField(this),
            {
                label: "Scene Location",
                type: "file-selector",
                value: () => this.content.file,
                valueReference: (file: string) => this.updateContent(file)
            },
            ...connectionField(this)
        ]
        this.icon = "icon-box";
        this.content = {
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

    public getScene(engine: BABYLON.Engine) : Promise<BABYLON.Scene> | undefined {
 
        const file = this.content.file;

        if (file) { // && scene
            // const rootURL = /(\w*\/)/gm.exec(file)?.join("");
            // const filename = /\w+\.\w+/gm.exec(file)?.join("");
            console.log(file);

            if (file) return BABYLON.SceneLoader.LoadAsync(
                file,
                "",
                engine
            );
        }
    }

        // const scene = new BABYLON.Scene(
        //     new BABYLON.Engine(
        //         canvas,
        //         true,
        //         undefined,
        //         true
        //     ));

    public updateContent(file?: string) {
        if (file) this.content.file = file;
    }
}

export const plugInExport: IPlugInRegistryEntry<AbstractStoryObject> = exportClass(
    _Scene,
    "Scene",
    "internal.content.scene",
    "icon-box",
    true
);
