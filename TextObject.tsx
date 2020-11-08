import { h } from "preact";
import StoryGraph from 'storygraph';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { IEdge } from 'storygraph/dist/StoryGraph/IEdge';
import { IGraph } from 'storygraph/dist/StoryGraph/IGraph';
import { IMetaData } from 'storygraph/dist/StoryGraph/IMetaData';
import { IReactiveInput } from 'storygraph/dist/StoryGraph/IReactiveInput';
import { IReactiveOutput } from 'storygraph/dist/StoryGraph/IReactiveOutput';
import { IRenderingProperties } from 'storygraph/dist/StoryGraph/IRenderingProperties';
import { IStoryModifier } from 'storygraph/dist/StoryGraph/IStoryModifier';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { rootStore } from '../renderer';
import {IPlugInRegistryEntry, IPlugIn, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";
import { v4 } from "uuid";
import { computed, makeObservable, observable } from 'mobx';
import { ContentType } from 'storygraph/dist/StoryGraph/ContentType';
/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
class _TextObject implements IPlugIn, IStoryObject{
    id = v4();
    userDefinedProperties: any;
    content?: IContent | undefined;
    metaData: IMetaData;
    outgoing: IEdge[];
    incoming: IEdge[];
    parent?: StoryGraph | undefined;
    network?: IGraph | undefined;
    renderingProperties: IRenderingProperties;
    modifiers: IStoryModifier[];
    outputs?: IReactiveOutput | undefined;
    inputs?: IReactiveInput[] | undefined;
    isContentNode = true;

    constructor() {
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
            type: ContentType.text
        };
        this.userDefinedProperties = {};

        makeObservable(this, {
            id: false,
            userDefinedProperties: observable,
            content:    observable,
            metaData:   observable,
            outgoing:   observable,
            incoming:   observable,
            modifiers:  observable,
            anotherGetter: computed
            // menuTemplate: computed
            // inputs:     observable,
            // outputs:    observable,
            // parent:     observable,
            // network:    observable
        })
    }

    // @computed
    get menuTemplate(): IMenuTemplate[]  {
        return [
            {
                label: "Text",
                type: "text",
                valueReference: null,
                valueTemplate: ""
            }
        ]
    }

    get anotherGetter(): string {
        return "Hello"
    }

    public render(): h.JSX.Element {
        return <div>Hello</div>
    }
}

/**
 * Define the metadata
 */
export const TextObject: IPlugInRegistryEntry<IStoryObject & IPlugIn> = makeObservable({
    name: "TextObject",
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