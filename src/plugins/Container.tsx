import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { v4 } from "uuid";
import { action, computed, makeAutoObservable, makeObservable, observable, reaction, IReactionDisposer } from 'mobx';
import { StoryGraph, IStoryObject, IEdge, IMetaData, IRenderingProperties } from 'storygraph';
import { IStoryModifier } from 'storygraph/dist/StoryGraph/IStoryModifier';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { IPlugInRegistryEntry, IPlugIn, IMenuTemplate, INGWebSProps } from "../renderer/utils/PlugInClassRegistry";

import { defaultFields } from './helpers/plugInHelpers';
import { IConnectorPort } from 'storygraph/dist/StoryGraph/IConnectorPort';

/**
 * Our second little dummy PlugIn
 * 
 * 
 */
class _Container implements IPlugIn, IStoryObject{
    id: string;
    name: string;
    role: string;
    userDefinedProperties: any;
    metaData: IMetaData;
    connections: IEdge[];
    parent?: string;
    renderingProperties: IRenderingProperties;
    modifiers: IStoryModifier[];
    isContentNode = false;
    childNetwork: StoryGraph;
    connectors: IConnectorPort[]

    constructor() {
        this.id = v4();
        this.role = "internal.container.container";
        this.name = "Container" // [this.role, this.id].join("_");
        this.renderingProperties = {
            width: 100,
            order: 1,
            collapsable: false
        };
        this.modifiers = [];
        this.connections = [];
        this.metaData = {
            createdAt: new Date(Date.now()),
            name: "NGWebS user",
            tags: []
        };
        this.childNetwork = makeAutoObservable(new StoryGraph(this));
        this.userDefinedProperties = {};
        this.connectors = [
            {name: "flow-in", type: "flow", direction: "in"},
            {name: "flow-out", type: "flow", direction: "out"}
        ];

        makeObservable(this, {
            id: false,
            name: observable,
            userDefinedProperties:  observable,
            childNetwork:           observable.deep,
            metaData:               observable,
            connections:               observable,
            modifiers:              observable,
            menuTemplate:           computed,
            updateName:             action
        });
    }

    // @computed
    get menuTemplate(): IMenuTemplate[]  {
        return [
            {
                label: "Name",
                type: "text",
                valueReference: (name: string) => {this.updateName(name)},
                value: () => (this.name)
            }, ...defaultFields(this)
            // {
            //     label: "Text",
            //     type: "textarea",
            //     valueReference: this.updateName(),
            //     value: this.getName()
            // }
        ]
    }

    updateName(newValue: string): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        this.name = newValue;
    }

    updateConnections(registry: IRegistry, id: string, myport: string, theirport: string, direction: "in" | "out" = "in") {
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
                console.log(newEdge);
                parentNetwork.connect(registry, [newEdge]);
            }
        }
    }

    getName(): string {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        return this.name
    }

    public getComponent() {
        const Comp: FunctionComponent<INGWebSProps> = ({id, registry, graph}) => {
            const [_, setState] = useState({});
            let disposer: IReactionDisposer;
            useEffect(() => {
                disposer = reaction(
                    () => (graph?.nodes.length),
                    () => {
                        setState({});
                    }
                )
    
                return () => {
                    disposer();
                }
            });
            return <div id={id}>
                {
                    graph?.nodes.map(e => {
                        const Comp = (e as unknown as IPlugIn).getComponent();
        
                        return <Comp
                            registry={registry}
                            id={e.id}
                            renderingProperties={e.renderingProperties}
                            content={e.content}
                            modifiers={e.modifiers}
                            graph={e.childNetwork}
                        ></Comp>
                    }) || null
                }
            </div>
}
        return Comp
    }

    public willDeregister(registry: IRegistry): void {
        this.childNetwork.willDeregister(registry)
    }
}

/**
 * Define the metadata
 */
export const plugInExport: IPlugInRegistryEntry<IStoryObject & IPlugIn> = makeObservable({
    name: "Container",
    id: "internal.container.container",
    shortId: "container",
    author: "NGWebS-Core",
    version: "1.0.0",
    class: _Container
}, {
    name: false,
    id: false,
    shortId: false,
    author: false,
    version: false,
    class: false
});
