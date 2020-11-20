import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { makeAutoObservable, makeObservable, observable, reaction, IReactionDisposer, action } from 'mobx';
import { StoryGraph, IStoryObject } from 'storygraph';
import { IPlugInRegistryEntry, IPlugIn, INGWebSProps, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";
import { AbstractStoryObject } from "./helpers/AbstractStoryObject";
import { IConnectorPort } from 'storygraph/dist/StoryGraph/IConnectorPort';
import { connectionField, dropDownField, nameField } from './helpers/plugInHelpers';

/**
 * Our second little dummy PlugIn
 * 
 * 
 */
class _Container extends AbstractStoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork: StoryGraph;
    public connectors: IConnectorPort[];

    constructor() {
        super();

        this.name = "Container";
        this.role = "container";
        this.isContentNode = false;
        this.childNetwork = makeObservable(new StoryGraph(this), {
            nodes: observable,
            edges: observable,
            addNode: action,
            connect: action,
            disconnect: action,
            removeNode: action
        });
        // this.childNetwork = makeAutoObservable(new StoryGraph(this));
        this.connectors = [
            {name: "flow-in", type: "flow", direction: "in"},
            {name: "flow-out", type: "flow", direction: "out"}
        ];
        this.userDefinedProperties = {};

        makeObservable(this, {
            role: false,
            isContentNode: false,
            name: observable,
            userDefinedProperties: observable,
            childNetwork: observable.deep,
            connectors: observable,
            updateName: action
        });
    }

    public getComponent() {
        const Comp: FunctionComponent<INGWebSProps> = ({id, registry, graph}) => {
            const [, setState] = useState({});
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

    public updateName(name: string): void {
        this.name = name
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        throw new Error('Method not implemented.');
    }

    menuTemplate: IMenuTemplate[] = [
        ...nameField(this),
        ...dropDownField(this),
        {
            label: "Test",
            type: "text",
            value: () => this.name,
            valueReference: (name: string) => {this.updateName(name)}
        },
        ...connectionField(this)
    ]
    // public menuTemplate(): IMenuTemplate[] {

    //     return [
    //         //...super.menuTemplate()
    //         {
    //             label: "Test",
    //             type: "text",
    //             value: () => {return this.name},
    //             valueReference: (name: string) => this.name = name
    //         }
    //     ]
    // }
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
