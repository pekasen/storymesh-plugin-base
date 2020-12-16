import { action, makeObservable, observable } from 'mobx';
import { h, FunctionComponent } from "preact";
import { DataConnectorOutPort, IConnectorPort, StoryGraph } from 'storygraph';
import { IMenuTemplate, INGWebSProps } from '../renderer/utils/PlugInClassRegistry';
import { StoryObject } from './helpers/AbstractStoryObject';
import { connectionField, nameField } from './helpers/plugInHelpers';

// import * as Three from "three";
// import { GLTFLoader, GLTF } from "three/examples/jsm/loaders/GLTFLoader";
import { exportClass } from './helpers/exportClass';
import { createModelSchema, object } from 'serializr';
import { ContentSchema } from '../renderer/store/schemas/ContentSchema';

export interface ISceneContent {
    file: string
}

class _Scene extends StoryObject {
    public content: ISceneContent;
    public childNetwork?: StoryGraph | undefined;
    public name: string;
    public role: string;
    public isContentNode = true;
    public userDefinedProperties: unknown;
    public connectors: Map<string, IConnectorPort>;
    public menuTemplate: IMenuTemplate[];
    public icon: string;

    constructor() {
        super();

        this.name = "Scene";
        this.role = "internal.content.scene";
        this.connectors = new Map<string, IConnectorPort>();
        [
            // {
            //     name: "data-out",
            //     type: "data",
            //     direction: "out",
            //     call: () => this.content.file
            // }
            new DataConnectorOutPort(
                "data-out",
                () => this.content.file
            )
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
        if (file) return BABYLON.SceneLoader.LoadAsync(
            file,
            "",
            engine
        );

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
createModelSchema(_Scene, {})
export const plugInExport = exportClass(
    _Scene,
    "Scene",
    "internal.content.scene",
    "icon-box",
    true
);
