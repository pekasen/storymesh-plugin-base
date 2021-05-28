import { StoryObject } from "../helpers/AbstractStoryObject";
import { h } from "preact";
import { exportClass } from '../helpers/exportClass';
import { ConnectorPort, IConnectorPort, IEdge } from 'storygraph';
import { MenuTemplate } from "preact-sidebar";
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { makeObservable, observable, action } from 'mobx';
import { createModelSchema } from 'serializr';
import { Container } from "./Container";

export class OutputConnectorView extends StoryObject {
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

    protected _connectors = new Map<string, IConnectorPort>();

    constructor() {
        super();
        
        this.name = "Output";
        this.role = "internal.content.outputconnectorview";
        this.icon = OutputConnectorView.defaultIcon;
        this.connections = [];

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
        const parentNode = this.registry?.getValue(this.parent) as Container;
        if (!parentNode) return;
        parentNode.connectors.forEach((connector) => {
            const _conn = (connector as ConnectorPort);
            if (
                // if that thing is not present in our local map
                !this._connectors.has(_conn.id) &&
                // AND that thing is both flow and out
                connector.direction === "out" &&
                connector.type === "flow"
            ) {
                const newCon = _conn.reverse();
                newCon.id = _conn.id;
                if (this.notificationCenter !== undefined) newCon.bindTo(this.notificationCenter, this.id);
                this._connectors.set(newCon.id, newCon);
            }
        });
    }
}
createModelSchema(OutputConnectorView, {});

export const plugInExport = exportClass(
    OutputConnectorView,
    "OutputConnectorView",
    "internal.content.outputconnectorview",
    OutputConnectorView.defaultIcon,
    false
);
