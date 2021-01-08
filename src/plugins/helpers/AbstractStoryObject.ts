import { FunctionComponent } from "preact";
import { v4 } from "uuid";
import { action, makeObservable, observable } from 'mobx';
import { StoryGraph, IStoryObject, IConnectorPort, IEdge, IMetaData, IRenderingProperties } from 'storygraph';
import { IStoryModifier } from 'storygraph/dist/StoryGraph/IStoryModifier';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { IPlugIn, IMenuTemplate, INGWebSProps } from "../../renderer/utils/PlugInClassRegistry";
import { createModelSchema, identifier, object, optional, primitive } from 'serializr';
import { UserDefinedPropertiesSchema } from '../../renderer/store/schemas/UserDefinedPropertiesSchema';
import { MetaDataSchema } from '../../renderer/store/schemas/MetaDataSchema';
import { ContentSchema } from '../../renderer/store/schemas/ContentSchema';
import { rootStore } from '../../renderer';
// import { makeSchemas } from '../../renderer/store/schemas/AbstractStoryObjectSchema';
/**
 * Our second little dummy PlugIn
 * 
 * 
 */
// @
export abstract class AbstractStoryObject implements IPlugIn, IStoryObject{
    public id: string;
    public metaData: IMetaData;
    // public get connections(): IEdge[] {
    //     return []
    // }
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
            addConnection:          action,
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
    public addConnection(registry: IRegistry, id: string, myport: string, theirport: string, direction: "in" | "out" = "in"): void {
        if (this.parent) {
            const isIncoming = direction === "in";

            const parentNetwork = registry.getValue(this.parent)?.childNetwork;
            if (parentNetwork) {
                const newEdge: IEdge = {
                    id: (isIncoming) ? `edge.${id}.${this.id}` : `edge.${this.id}.${id}`,
                    from: ((isIncoming) ? `${id}.${theirport}` : `${this.id}.${myport}`),
                    to: ((isIncoming) ? `${this.id}.${myport}` : `${id}.${theirport}`),
                    // parent: parentNetwork
                };
                console.log("new Edge", newEdge);
                parentNetwork.connect(registry, [newEdge]);
            }
        }
    }
    
    public removeConnections(edges: IEdge[]): void {
        edges.forEach((edge) => {
            const _index = this.connections.findIndex((_edge) => (_edge.id === edge.id));
            if (_index !== -1) {
                if (this.connections.splice(_index, 1)[0].id === edge.id) {
                    console.log(`edge removed from node ${this.id}`);
                } else console.warn(`edge not removed in node ${this.id}`);
            } else console.warn(`edge not found in node ${this.id}`);  
        });
    }

    public abstract getComponent(): FunctionComponent<INGWebSProps> 

    public abstract getEditorComponent(): FunctionComponent<INGWebSProps> 

    public willDeregister(registry: IRegistry): void {
        if (this.childNetwork) this.childNetwork.willDeregister(registry)
    }

    protected makeFlowInAndOut(): void {
        const _in: IConnectorPort = { name: "flow-in", type: "flow", direction: "in" };
        const _out: IConnectorPort = { name: "flow-out", type: "flow", direction: "out" };
        _in.associated = _out;
        _out.associated = _in;

        [
            _in,
            _out
        ].forEach(e => {
            this.connectors.set(
                e.name, e as IConnectorPort
            );
        });
    }
}

export class StoryObject extends AbstractStoryObject {
    public name!: string;
    public role!: string;
    public isContentNode!: boolean;
    public userDefinedProperties: any;
    public childNetwork?: StoryGraph | undefined;
    public connectors!: Map<string, IConnectorPort>;
    public menuTemplate!: IMenuTemplate[];
    public icon!: string;
    public content?: any;
    
    // public get connections(): IEdge[] {
    //     if (this.parent) {
    //         const parent = reg.getValue(this.parent);
    //         const _res = parent?.childNetwork?.filterEdges((e) => e.id.search(this.id) !== 0);
    //         if (_res) return _res 
    //         else return []
    //     } else return []
    // }

    public getComponent(): FunctionComponent<INGWebSProps> {
        throw new Error('Method not implemented.');
    }
    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        throw new Error('Method not implemented.');
    }
}
export const StoryObjectSchema = createModelSchema(StoryObject, {
    id: identifier(
        (id: string, obj) => {
            const reg = rootStore._loadingCache;
            console.log("registering @valuecache", obj,reg.set(id, obj))
        }
    ),
    name: primitive(),
    role: primitive(),
    isContentNode: primitive(),
    userDefinedProperties: object(UserDefinedPropertiesSchema),
    metaData: object(MetaDataSchema),
    content: optional(object(ContentSchema)),
    parent: optional(primitive())
});
// StoryObjectSchema.props.parent = reference(StoryObject);
// setDefaultModelSchema(StoryObject, AbstractStoryObjectSchema)