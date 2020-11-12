import { h } from "preact";
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { IEdge } from 'storygraph/dist/StoryGraph/IEdge';
import { IGraph } from 'storygraph/dist/StoryGraph/IGraph';
import { IMetaData } from 'storygraph/dist/StoryGraph/IMetaData';
import { IReactiveInput } from 'storygraph/dist/StoryGraph/IReactiveInput';
import { IReactiveOutput } from 'storygraph/dist/StoryGraph/IReactiveOutput';
import { IRenderingProperties } from 'storygraph/dist/StoryGraph/IRenderingProperties';
import { IStoryModifier } from 'storygraph/dist/StoryGraph/IStoryModifier';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import {IPlugInRegistryEntry, IPlugIn, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";

import { v4 } from "uuid";
import { action, computed, makeObservable, observable } from 'mobx';
/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
class _TextObject implements IPlugIn, IStoryObject{
    id = v4();
    role: string
    name: string;
    userDefinedProperties: any;
    content?: IContent | undefined;
    metaData: IMetaData;
    outgoing: IEdge[];
    incoming: IEdge[];
    parent?: string;
    network?: IGraph | undefined;
    renderingProperties: IRenderingProperties;
    modifiers: IStoryModifier[];
    outputs?: IReactiveOutput | undefined;
    inputs?: IReactiveInput[] | undefined;
    isContentNode = true;

    constructor() {
        this.role = "content"
        this.name = "Text" // [this.role, this.id].join("_");
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
            outgoing:   observable,
            incoming:   observable,
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
            }
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


    public render(): h.JSX.Element {
        return <div>Hello</div>
    }
}

/**
 * Define the metadata
 */
export const plugInExport: IPlugInRegistryEntry<IStoryObject & IPlugIn> = makeObservable({
    name: "Text",
    id: "internal.content.text",
    shortId: "text",
    author: "NGWebS-Core",
    version: "1.0.0",
    class: _TextObject
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