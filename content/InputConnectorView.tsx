import { AbstractStoryObject, StoryObject } from "../helpers/AbstractStoryObject";
import { h } from "preact";
import { exportClass } from '../helpers/exportClass';
import { IConnectorPort, IEdge } from 'storygraph';
import { ConnectorPort } from "../../renderer/utils/ConnectorPort";
import { IMenuTemplate } from '../../renderer/utils/PlugInClassRegistry';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema } from 'serializr';

export class InputConnectorView extends StoryObject {
    public name: string;
    public role: string;
    public icon: string;
    public connections: IEdge[];
    // public connectors: Map<string, IConnectorPort>;
    public content: undefined;
    public childNetwork: undefined;
    public userDefinedProperties: undefined;
    public isContentNode = false;
    public deletable = false;

    public static defaultIcon = "icon-down";
    public registry?: IRegistry;

    constructor() {
        super();
        
        this.name = "Input";
        this.role = "internal.content.inputconnectorview";
        this.icon = InputConnectorView.defaultIcon;
        // this.menuTemplate = [
        //     ...nameField(this),
        //     ...connectionField(this)
        // ];
        this.connections = [];
        // this.connectors = new Map<string, IConnectorPort>();

        makeObservable(this,{
            name: observable,
            updateName: action,
            addConnection: action
        });
    }

    setup(registry: IRegistry): void {
        this.registry = registry;
        // if (!this.parent) throw("No, no, no, ye' dirty olde bastard!");
        // const parentNode = registry.getValue(this.parent) as StoryObject;
        // if (!parentNode) throw("No, no, no, that'S not possible!");
        // // this.menuTemplate = parentNode.menuTemplate;

        // parentNode.
        // connectors.
        // forEach(e => {
        //     const _new = new ConnectorPort(e.type, "out");
        //     if (e.direction === "in") {
        //         this.connectors.set(
        //             _new.name, _new
        //         )
        //     }
        // });
    }

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
            ...nameField(this),
            ...connectionField(this)
        ];
        if (super.menuTemplate) ret.push(...super.menuTemplate);
        return ret;
    }

    public get connectors(): Map<string, IConnectorPort> {
        const map = super.connectors;

        if (!this.parent) throw("No, no, no, ye' dirty olde bastard!");
        const parentNode = this.registry?.getValue(this.parent) as AbstractStoryObject;
        if (!parentNode) throw("No, no, no, that'S not possible!");

        parentNode.
        connectors.
        forEach(e => {
            if (e.direction === "in" && e.type === "flow") {
                const _new = new ConnectorPort(e.type, "out");
                map.set(
                    _new.name, _new
                )
            }
        });
        
        // [
        //     {
        //         name: "data-in",
        //         type: "data",
        //         direction: "in"
        //     },
        //     {
        //         name: "flow-in",
        //         type: "flow",
        //         direction: "in"
        //     },
        //     {
        //         name: "flow-out",
        //         type: "flow",
        //         direction: "out"
        //     },
        // ].forEach(e => map.set(e.name, e as IConnectorPort));
        return map;
    }

    getComponent() {
        return () => null
    }

    getEditorComponent() {
        return () => <div></div>
    }

    updateName(name: string): void {
        this.name = name;
    }
}
createModelSchema(InputConnectorView, {});
export const plugInExport = exportClass(
    InputConnectorView,
    "InputConnectorView",
    "internal.content.inputconnectorview",
    InputConnectorView.defaultIcon,
    false
);
