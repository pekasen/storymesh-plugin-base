import { FunctionComponent } from "preact";
import { v4 } from "uuid";
import { action, makeObservable, observable } from 'mobx';
import { StoryGraph, IConnectorPort, IEdge, IMetaData, IRenderingProperties, FlowConnectorInPort, FlowConnectorOutPort, DataConnectorInPort } from 'storygraph';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { IPlugIn, INGWebSProps } from "../../renderer/utils/PlugInClassRegistry";
import { Card, MenuTemplate } from "preact-sidebar";
import { createModelSchema, custom, deserialize, getDefaultModelSchema, identifier, list, map, object, optional, primitive, serialize } from 'serializr';
import { UserDefinedPropertiesSchema } from '../../renderer/store/schemas/UserDefinedPropertiesSchema';
import { MetaDataSchema } from '../../renderer/store/schemas/MetaDataSchema';
import { ContentSchema } from '../../renderer/store/schemas/ContentSchema';
import { rootStore } from '../../renderer';
import { AbstractStoryModifier } from "./AbstractModifier";
import { NotificationCenter } from "storygraph/dist/StoryGraph/NotificationCenter";
import { EdgeSchema } from "../../renderer/store/schemas/EdgeSchema";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import Logger, { ILogger } from "js-logger";
import { StoryObject as StoryObject0 } from "storygraph"

export class StoryObject extends StoryObject0 implements IPlugIn{
    
    public id: string = v4();
    public metaData: IMetaData = {
        createdAt: new Date(Date.now()),
        name: "NGWebS default user",
        tags: []
    };
    public renderingProperties: IRenderingProperties = {
        width: 100,
        order: 1,
        collapsable: false
    };
    public subscriptions = [
        {
            id: this.id+"/rerender",        // notificationCenter.subscribe(this.id+"/rerender"
            hook: () => {
                if (this._rerender !== undefined) this._rerender();
            }
        },
    ];
    public connections: IEdge[] = [];
    public modifiers: AbstractStoryModifier[] = [];
    public deletable: boolean = true;
    public logger: ILogger = Logger.get(this.id);

    public name!: string;
    public role!: string;
    public parent?: string;
    public icon!: string;
    public isContentNode!: boolean;
    public notificationCenter?: NotificationCenter;
    public childNetwork?: StoryGraph | undefined;
    public content?: any;
    public userDefinedProperties: any;

    protected _connectors = new Map<string, IConnectorPort>();
    protected _rerender?: (() => void);

    constructor() {
        super();
        
        makeObservable(this, {
            id: false,
            metaData:               observable,
            connections:            observable,
            modifiers:              observable.deep,
            // cannot make connectors as computed as it will fuck up everything and the world.
            // connectors:             computed,
            addConnection:          action,
            addModifier:            action,
            removeModifier:         action
        });
    }

    
    public addConnections(edges: IEdge[]): void {
        // store locally
        this.connections.push(...edges);
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
                    id: "edge." + v4(), // (isIncoming) ? `edge.${id}.${this.id}` : `edge.${this.id}.${id}`,
                    from: ((isIncoming) ? `${id}.${theirport}` : `${this.id}.${myport}`),
                    to: ((isIncoming) ? `${this.id}.${myport}` : `${id}.${theirport}`),
                    // parent: parentNetwork
                };
                Logger.info("new Edge", newEdge);
                parentNetwork.connect(registry, [newEdge]);
            }
        }
    }
    public removeConnections(edges: IEdge[]): void {
        edges.forEach((edge) => {
            const _index = this.connections.findIndex((_edge) => (_edge.id === edge.id));
            if (_index !== -1) {
                if (this.connections.splice(_index, 1)[0].id === edge.id) {
                    Logger.info(`edge removed from node ${this.id}`);
                } else console.warn(`edge not removed in node ${this.id}`);
            } else console.warn(`edge not found in node ${this.id}`);  
        });
    }
    public addModifier(modifier: AbstractStoryModifier): void {
        modifier.updateParent(this.id);
        this.modifiers.push(modifier);
    }
    public removeModifier(modifier: AbstractStoryModifier): void {
        this.modifiers.splice(
            this.modifiers.indexOf(modifier), 1
        );
    }
    public willDeregister(registry: IRegistry): void {
        if (this.childNetwork) this.childNetwork.willDeregister(registry)
    }
    public get connectors(): Map<string, IConnectorPort> {
        const map = new Map(this._connectors);
        this.modifiers.forEach(modifier => {
            modifier.requestConnectors().forEach(([label, connector]) => {
                if (connector.needsBinding() && this.notificationCenter !== undefined) {
                    connector.bindTo(this.notificationCenter, this.id);
                }
                map.set(label, connector);
            });
        });
        return map
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [];
        ret.push(
            ...this.modifiers.map(modifier => (
                new Card(modifier.name, {
                    items: modifier.menuTemplate
                })
            ))
        );
        return ret;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        throw new Error('Method not implemented.');
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        throw new Error('Method not implemented.');
    }

    public isBound(): void {
        // throw new Error("Method not implemented.");
        this.logger.log("READY TO ROLL");
    }

    public mountTo(): void {
        throw new Error("Method not implemented.");
    }

    public isMounted(): void {
        throw new Error("Method not implemented.");
    }

    protected makeDefaultConnectors(): void {
        const _in = new FlowConnectorInPort();
        const _out = new FlowConnectorOutPort();
        const _data = new DataConnectorInPort("data-in", (data: unknown) => {this.content = data});

        _in.associated = _out.id;
        _out.associated = _in.id;
        
        if (this.notificationCenter) {
            _in.bindTo(this.notificationCenter, this.id)
            _out.bindTo(this.notificationCenter, this.id)
        }

        [
            _in,
            _out,
            _data
        ].forEach(e => {
            this._connectors.set(
                e.id, e
            );
        });
    }
}

export const StoryObjectSchema = createModelSchema(StoryObject, {
    id: identifier(
        (id: string, obj) => {
            const reg = rootStore._loadingCache;
            Logger.info("registering @valuecache", obj,reg.set(id, obj))
        }
    ),
    name: primitive(),
    role: primitive(),
    isContentNode: primitive(),
    userDefinedProperties: object(UserDefinedPropertiesSchema),
    metaData: object(MetaDataSchema),
     // TODO: if this property is present in the ModelSchema, it cannot be overwritten by extending model schemas.
    // content: optional(object(ContentSchema)),
    parent: optional(primitive()),
    connections: list(object(EdgeSchema)),
    _connectors: map(object(ConnectorSchema)),
    modifiers: list(custom(
        (value: Record<string, unknown>) => {
            const schema = getDefaultModelSchema(value.constructor);
            if (!schema) throw("could not get schema for " + value.constructor.name);
            return serialize(schema, value);
        },
        (jsonValue, context, callback) => {
            const instance = rootStore.root.pluginStore.getNewInstance(jsonValue.role);
            if (!instance) throw("Big time failure !!11 while fetching schema for" + jsonValue.role);
            Logger.info("getting schema for", instance.constructor.name);
            const _schema = getDefaultModelSchema(instance.constructor);
            if (!_schema) throw("no schema present during deserialization for " + context.target.constructor.name);
            return deserialize(_schema, jsonValue, callback);
        }
    ))
});
