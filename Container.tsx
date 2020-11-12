import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { StoryGraph } from 'storygraph/dist/StoryGraph/StoryGraph';
import { IEdge } from 'storygraph/dist/StoryGraph/IEdge';
import { IGraph } from 'storygraph/dist/StoryGraph/IGraph';
import { IMetaData } from 'storygraph/dist/StoryGraph/IMetaData';
import { IReactiveInput } from 'storygraph/dist/StoryGraph/IReactiveInput';
import { IReactiveOutput } from 'storygraph/dist/StoryGraph/IReactiveOutput';
import { IRenderingProperties } from 'storygraph/dist/StoryGraph/IRenderingProperties';
import { IStoryModifier } from 'storygraph/dist/StoryGraph/IStoryModifier';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { IPlugInRegistryEntry, IPlugIn, IMenuTemplate, INGWebSProps } from "../renderer/utils/PlugInClassRegistry";

import { v4 } from "uuid";
import { action, computed, makeAutoObservable, makeObservable, observable, reaction, IReactionDisposer } from 'mobx';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';

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
    outgoing: IEdge[];
    incoming: IEdge[];
    parent?: string;
    network: IGraph | undefined;
    renderingProperties: IRenderingProperties;
    modifiers: IStoryModifier[];
    outputs?: IReactiveOutput | undefined;
    inputs?: IReactiveInput[] | undefined;
    isContentNode = true;
    childNetwork: StoryGraph;

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
        this.outgoing = [];
        this.incoming = [];
        this.metaData = {
            createdAt: new Date(Date.now()),
            name: "NGWebS user",
            tags: []
        };
        this.childNetwork = makeAutoObservable(new StoryGraph(this));
        this.userDefinedProperties = {};

        makeObservable(this, {
            id: false,
            name: observable,
            userDefinedProperties:  observable,
            childNetwork:           observable.deep,
            metaData:               observable,
            outgoing:               observable,
            incoming:               observable,
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
            },
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
