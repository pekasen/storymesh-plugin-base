import { AbstractStoryObject, StoryObject } from "../helpers/AbstractStoryObject";
import { h } from "preact";
import { exportClass } from '../helpers/exportClass';
import { ConnectorPort, FlowConnectorInPort, FlowConnectorOutPort, IConnectorPort, IEdge } from 'storygraph';
import { IMenuTemplate } from '../../renderer/utils/PlugInClassRegistry';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema } from 'serializr';
import { rootStore } from "../../renderer";

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

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
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
        const parentNode = this.registry?.getValue(this.parent) as AbstractStoryObject;
        if (!parentNode) return;
        if (parentNode.connectors.size !== this._connectors.size) {
            parentNode.
            connectors.
            forEach((e: IConnectorPort) => {
                if (e.direction === "in" && e.type === "flow") {
                    const f = (e as FlowConnectorInPort).reverse()
                    f.id = (e as ConnectorPort).id;
                    this._connectors.set(
                        f.id, f
                    )
                }
            });
        }
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
