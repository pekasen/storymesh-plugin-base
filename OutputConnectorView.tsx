import { AbstractStoryObject } from "./helpers/AbstractStoryObject";
import { h } from "preact";
import { exportClass } from './helpers/exportClass';
import { IConnectorPort, IEdge } from 'storygraph';
import { IMenuTemplate } from '../renderer/utils/PlugInClassRegistry';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { connectionField, nameField } from './helpers/plugInHelpers';

export class OutputConnectorView extends AbstractStoryObject {
    public name: string;
    public role: string;
    public icon: string;
    public connections: IEdge[];
    public connectors: IConnectorPort[];
    public content: undefined;
    public childNetwork: undefined;
    public userDefinedProperties: undefined;
    public menuTemplate: IMenuTemplate[];
    public isContentNode = false;
    public deletable = false;

    public static defaultIcon: "icon-down-circled";

    constructor() {
        super();
        
        this.name = "Outputs";
        this.role = "internal.container.outputconnectorview";
        this.icon = OutputConnectorView.defaultIcon;
        this.menuTemplate = [
            ...nameField(this),
            ...connectionField(this)
        ];
        this.connections = [];
        this.connectors = [];
    }

    setup(registry: IRegistry) {
        if (!this.parent) throw("No, no, no, ye' dirty olde bastard!");
        const parentNode = registry.getValue(this.parent) as AbstractStoryObject;
        if (!parentNode) throw("No, no, no, that'S not possible!");
        this.connectors = parentNode.
        connectors.
        filter(e => e.direction === "out").
        map(() => ({
            name: "flow-in",
            direction: "in",
            type: "flow"
        }));
    }

    getComponent() {
        return () => <div></div>
    }

    getEditorComponent() {
        return () => <div></div>
    }

    updateName(name: string): void {
        this.name = name;
    }
}

export const plugInExport = exportClass(
    OutputConnectorView,
    "OutputConnectorView",
    "internal.container.outputconnectorview",
    OutputConnectorView.defaultIcon,
    false
);
