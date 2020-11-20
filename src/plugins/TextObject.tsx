import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { reaction, IReactionDisposer } from "mobx";

import {IPlugInRegistryEntry, IPlugIn, IMenuTemplate, INGWebSProps } from "../renderer/utils/PlugInClassRegistry";

import { v4 } from "uuid";
import { action, computed, makeObservable, observable } from 'mobx';
import { IStoryObject, IMetaData, IEdge, IRenderingProperties, IStoryModifier, IConnectorPort, StoryGraph } from 'storygraph';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, dropDownField, nameField } from './helpers/plugInHelpers';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
class _TextObject extends AbstractStoryObject {
    
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public content: IContent;
    public childNetwork?: StoryGraph | undefined;
    public connectors: IConnectorPort[];
    public menuTemplate: IMenuTemplate[];

    constructor() {

        super();
        this.isContentNode = true;
        this.role = "content"
        this.name = "Text" // [this.role, this.id].join("_");
        this.renderingProperties = {
            width: 100,
            order: 1,
            collapsable: false
        };
        this.connectors = [
            {
                name: "flow-in",
                type: "flow",
                direction: "in"
            },
            {
                name: "flow-out",
                type: "flow",
                direction: "out"
            },
            {
                name: "enterView",
                type: "reaction",
                direction: "out"
            }
        ];
        this.content = {
            resource: "Type here...",
            altText: "empty",
            contentType: "text"
        };
        this.userDefinedProperties = {};
        this.menuTemplate = [
            ...nameField(this),
            {
                label: "Content",
                type: "textarea",
                value: () => this.content.resource,
                valueReference: (text: string) => {this.updateText(text)}
            },
            ...dropDownField(this),
            ...connectionField(this)
        ];

        makeObservable(this, {
            id: false,
            name:                   observable,
            userDefinedProperties:  observable,
            content:                observable,
            updateName:             action,
            updateText:             action
        });
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        throw new Error('Method not implemented.');
    }

    public updateName(newValue: string): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        this.name = newValue;
    }

    public updateText(text: string) {
        if (this.content) this.content.resource = text;
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
            });
            return <p>
                {
                    content?.resource
                }
            </p>
        }
        return Comp
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