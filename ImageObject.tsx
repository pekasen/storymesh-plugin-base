import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { IPlugInRegistryEntry, IPlugIn, IMenuTemplate, INGWebSProps } from "../renderer/utils/PlugInClassRegistry";

import { v4 } from "uuid";
import { action, computed, IReactionDisposer, makeObservable, observable, reaction } from 'mobx';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { defaultFields } from './helpers/plugInHelpers';
import { IStoryObject, IEdge, IConnectorPort, IMetaData, IRenderingProperties, IStoryModifier } from 'storygraph';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
class _ImageObject implements IPlugIn, IStoryObject{
    id = v4();
    role: string
    name: string;
    userDefinedProperties: any;
    content?: IContent | undefined;
    metaData: IMetaData;
    connections: IEdge[];
    connectors: IConnectorPort[];
    parent?: string;
    renderingProperties: IRenderingProperties;
    modifiers: IStoryModifier[];
    isContentNode = true;

    constructor() {
        this.role = "content"
        this.name = "Image" // [this.role, this.id].join("_");
        this.renderingProperties = {
            width: 100,
            order: 1,
            collapsable: false
        };
        this.modifiers = [];
        this.connections = [];
        this.connectors = [
            {name: "flow-in", type: "flow", direction:"in"},
            {name: "flow-out", type: "flow", direction:"out"},
            {name: "fade", type: "reaction", direction: "in"}
        ]
        this.metaData = {
            createdAt: new Date(Date.now()),
            name: "NGWebS user",
            tags: []
        };
        this.content = {
            resource: "empty",
            altText: "empty",
            contentType: "text"
        };
        this.userDefinedProperties = {};

        makeObservable(this, {
            id: false,
            name: observable,
            userDefinedProperties: observable,
            content:    observable,
            metaData:   observable,
            connections:   observable,
            connectors: observable,
            modifiers:  observable,
            menuTemplate: computed,
            updateText: action,
            updateName: action
            // menuTemplate: computed
            // inputs:     observable,
            // outputs:    observable,
            // parent:     observable,
            // network:    observable
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
            {
                label: "Content",
                type: "text",
                valueReference: (text: string) => {this.updateText(text)},
                value: () => (this.content?.resource as string)
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

    updateText(text: string) {
        if (this.content) this.content.resource = text;
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

    public getComponent() {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {

            const [_, setState] = useState({});
            let disposer: IReactionDisposer;
            useEffect(() => {
                disposer = reaction(
                    () => (content?.resource),
                    () => {
                        setState({});
                    }
                )

                return () => {
                    disposer();
                }
            })

            return <img src={content?.resource}></img>
        }
        return Comp
    }
}

/**
 * Define the metadata
 */
export const plugInExport: IPlugInRegistryEntry<IStoryObject & IPlugIn> = makeObservable({
    name: "Image",
    id: "internal.content.image",
    shortId: "image",
    author: "NGWebS-Core",
    version: "1.0.0",
    class: _ImageObject
}, {
    name: false,
    id: false,
    shortId: false,
    author: false,
    version: false,
    class: false
});


/**
 * Let's plug ourselves in!
 */
// rootStore.storyContentTemplatesRegistry.register([TextObject]);