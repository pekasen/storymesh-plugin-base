import { h } from "preact";
import { connectionField, nameField, exportClass, StoryObject, IRegistry, ConnectorPort, IConnectorPort, IEdge } from 'storygraph';
import { MenuTemplate } from "preact-sidebar";
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema } from 'serializr';
import { Container } from "../content/Container";
import { StoryPlugIn } from "../../../storygraph/dist/StoryGraph/registry/PlugIn";

export class InputConnectorView extends StoryObject {
    
    public name: string;
    public role: string;
    public icon: string;
    public connections: IEdge[];
    public content: undefined;
    public childNetwork: undefined;
    public userDefinedProperties: undefined;
    public isContentNode = false;
    public deletable = false;
    
    public static defaultIcon = "icon-down";
    public registry?: IRegistry;
    
    protected _connectors: Map<string, IConnectorPort>;
    
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
        this._connectors = new Map<string, IConnectorPort>();

        makeObservable(this,{
            name: observable,
            updateName: action,
            addConnection: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            ...connectionField(this)
        ];
        if (super.menuTemplate) ret.push(...super.menuTemplate);
        return ret;
    }

    public get connectors(): Map<string, IConnectorPort> {
        this.updateConnectors();
        return super.connectors;
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

    setup(id: string, registry: IRegistry): void {
        this.parent = id;
        this.registry = registry;
    }

    private updateConnectors(): void {
        if (!this.parent) return;
        const parentNode = this.registry?.get(this.parent) as Container;
        if (!parentNode) return;
        parentNode.connectors.forEach((connector) => {
            const _conn = (connector as ConnectorPort);
            if (
                // if that thing is not present in our local map
                !this._connectors.has(_conn.id) &&
                // AND that thing is both flow and out
                connector.direction === "in"
            ) {
                const newCon = _conn.reverse();
                newCon.id = _conn.id;
                if (this.notificationCenter !== undefined) newCon.bindTo(this.notificationCenter, this.id);
                this._connectors.set(_conn.id, newCon);
            }
        });
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

export const InputConnectorViewPlugIn: StoryPlugIn = {
    name: "InputConnectorView",
    id: "internal.content.inputconnectorview",
    public: false,
    icon:     InputConnectorView.defaultIcon,

    // package: {},
    constructor: InputConnectorView
}
