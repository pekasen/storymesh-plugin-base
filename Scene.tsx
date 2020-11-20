import { makeObservable } from 'mobx';
import { h, FunctionalComponent } from "preact";
import { IConnectorPort, IStoryObject } from 'storygraph';
import { IPlugInRegistryEntry, IPlugIn, IMenuTemplate } from '../renderer/utils/PlugInClassRegistry';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
import { connectionField, nameField } from './helpers/plugInHelpers';

class _Scene extends AbstractStoryObject {
    public name: string
    public role: string
    public isContentNode = true
    public userDefinedProperties: any
    public connectors: IConnectorPort[]
    public menuTemplate: IMenuTemplate[]

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
    }

    public updateName(name: string): void {
        this.name = name;
    }

    getComponent() {
        return () => (<p style="display: none;"></p>)
    }
}

export const plugInExport: IPlugInRegistryEntry<IStoryObject & IPlugIn> = makeObservable({
    name: "Scene",
    id: "internal.content.scene",
    shortId: "scene",
    author: "NGWebS-Core",
    version: "1.0.0",
    class: _Scene
}, {
    name: false,
    id: false,
    shortId: false,
    author: false,
    version: false,
    class: false
});
