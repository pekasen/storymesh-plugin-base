import { makeObservable, observable } from 'mobx';
import { h, FunctionalComponent, FunctionComponent } from "preact";
import { IConnectorPort, IStoryObject, StoryGraph } from 'storygraph';
import { IPlugInRegistryEntry, IPlugIn, IMenuTemplate, INGWebSProps } from '../renderer/utils/PlugInClassRegistry';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
import { connectionField, nameField } from './helpers/plugInHelpers';
import { Scene } from "three";
import { exportClass } from './helpers/exportClass';
class _Scene extends AbstractStoryObject {
    public childNetwork?: StoryGraph | undefined;
    public name: string;
    public role: string;
    public isContentNode = true;
    public userDefinedProperties: any;
    public connectors: IConnectorPort[];
    public menuTemplate: IMenuTemplate[];
    public icon: string;

    public scene: Scene;

    constructor() {
        super();

        this.name = "Scene";
        this.role = "scene";
        this.connectors = [
            {
                name: "data-out",
                type: "data",
                direction: "out"
            }

        ];
        this.menuTemplate = [
            ...nameField(this),
            ...connectionField(this)
        ]
        this.icon = "icon-box";
        this.scene = new Scene();

        makeObservable(
            this, {
            connectors: observable,
            name: observable
        });
    }

    public updateName(name: string): void {
        this.name = name;
    }

    getComponent() {
        return () => (<p style="display: none;"></p>)
    }

    getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component"></div>
    }

    getScene() {
        return this.scene;
    }
}

export const plugInExport: IPlugInRegistryEntry<AbstractStoryObject> = exportClass(
    _Scene,
    "Scene",
    "internal.content.scene",
    "icon-box"
);
