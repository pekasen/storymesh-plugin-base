import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { IPlugInRegistryEntry, IPlugIn, INGWebSProps, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";

import { action, IReactionDisposer, makeObservable, observable, reaction } from 'mobx';
import { IStoryObject, IConnectorPort, StoryGraph } from 'storygraph';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { defaultFields } from './helpers/plugInHelpers';

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
class _ImageObject extends AbstractStoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork?: StoryGraph;
    public connectors: IConnectorPort[];
    public content: IContent;
    public menuTemplate: IMenuTemplate[];

    constructor() {
        super();

        this.name = "Image";
        this.role = "image";
        this.isContentNode = true;
        this.userDefinedProperties = {};
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
            }
        ];
        this.content = {
            resource: "new URL",
            contentType: "url",
            altText: "This is an image"
        }
        this.menuTemplate = defaultFields(this);

        makeObservable(this,{
            name:       observable,
            userDefinedProperties: observable,
            connectors: observable,
            content: observable,
            updateName: action,
            updateImageURL: action
        });
    }
    public updateImageURL(newURL: string) {
        this.content.resource = newURL;
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
            const [, setState] = useState({});
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

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        throw new Error('Method not implemented.');
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