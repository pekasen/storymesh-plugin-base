import { makeObservable, observable } from 'mobx';
import { h, FunctionalComponent, FunctionComponent } from "preact";
import { IConnectorPort, IStoryObject, StoryGraph } from 'storygraph';
import { IPlugInRegistryEntry, IPlugIn, IMenuTemplate, INGWebSProps } from '../renderer/utils/PlugInClassRegistry';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
import { connectionField, nameField } from './helpers/plugInHelpers';

class _Scene extends AbstractStoryObject {
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
                direction: "out"
            }

        ];
        this.menuTemplate = [
            ...nameField(this),
            ...connectionField(this)
        ]
        this.icon = "icon-box";

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
        throw("method not implemented yet.")
    }
}

export const plugInExport: IPlugInRegistryEntry<IStoryObject & IPlugIn> = makeObservable({
    name: "Scene",
    id: "internal.content.scene",
    shortId: "scene",
    author: "NGWebS-Core",
    version: "1.0.0",
    icon: "icon-box",
    class: _Scene
}, {
    name: false,
    id: false,
    shortId: false,
    author: false,
    version: false,
    class: false
});
