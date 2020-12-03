import { FunctionComponent } from "preact";
import { v4 } from "uuid";
import { action, makeObservable, observable } from 'mobx';
import { StoryGraph, IStoryObject, IConnectorPort, IEdge, IMetaData, IRenderingProperties } from 'storygraph';
import { IStoryModifier } from 'storygraph/dist/StoryGraph/IStoryModifier';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { IPlugIn, IMenuTemplate, INGWebSProps } from "../../renderer/utils/PlugInClassRegistry";
/**
 * Our second little dummy PlugIn
 * 
 * 
 */
export abstract class AbstractStoryObject implements IPlugIn, IStoryObject{
    public id: string;
    public metaData: IMetaData;
    public connections: IEdge[];
    public parent?: string;
    public renderingProperties: IRenderingProperties;
    public modifiers: IStoryModifier[];
    public deletable: boolean;
    public abstract name: string;
    public abstract role: string;
    public abstract isContentNode: boolean;
    public abstract userDefinedProperties: any;
    public abstract childNetwork?: StoryGraph;
    public abstract connectors: Map<string, IConnectorPort>
    public abstract menuTemplate: IMenuTemplate[]
    public abstract icon: string
    public abstract content?: any;
    
    constructor() {
        this.id = v4();
        this.renderingProperties = {
            width: 100,
            order: 1,
            collapsable: false
        };
        this.modifiers = [];
        this.connections = [];
        this.metaData = {
            createdAt: new Date(Date.now()),
            name: "NGWebS default user",
            tags: []
        };
        this.deletable = true;

        makeObservable(this, {
            id: false,
            metaData:               observable,
            connections:            observable,
            modifiers:              observable,
            updateConnections:      action,
        });
    }

    /**
     * 
     * @param registry Registry
     * @param id their id
     * @param myport our port
     * @param theirport their port
     * @param direction which direction does the edge point? 
     */
    updateConnections(registry: IRegistry, id: string, myport: string, theirport: string, direction: "in" | "out" = "in"): void {
        if (this.parent) {
            const isIncoming = direction === "in";

            const parentNetwork = registry.getValue(this.parent)?.childNetwork;
            if (parentNetwork) {
                const newEdge: IEdge = {
                    id: (isIncoming) ? `edge.${id}.${this.id}` : `edge.${this.id}.${id}`,
                    from: ((isIncoming) ? `${id}.${theirport}` : `${this.id}.${myport}`),
                    to: ((isIncoming) ? `${this.id}.${myport}` : `${id}.${theirport}`),
                    parent: parentNetwork
                };
                console.log("new Edge", newEdge);
                parentNetwork.connect(registry, [newEdge]);
            }
        }
    }

    public abstract getComponent(): FunctionComponent<INGWebSProps> 

    public abstract getEditorComponent(): FunctionComponent<INGWebSProps> 

    public willDeregister(registry: IRegistry): void {
        if (this.childNetwork) this.childNetwork.willDeregister(registry)
    }
}
