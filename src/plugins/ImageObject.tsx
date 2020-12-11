import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { INGWebSProps, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";

import { action, IReactionDisposer, makeObservable, observable, reaction } from 'mobx';
import { IConnectorPort, StoryGraph } from 'storygraph';
import { StoryObject } from './helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField } from './helpers/plugInHelpers';
import { exportClass } from './helpers/exportClass';
import { createModelSchema, object, primitive } from 'serializr';
import { ContentSchema } from '../renderer/store/schemas/ContentSchema';

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
class _ImageObject extends StoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork?: StoryGraph;
    public connectors: Map<string, IConnectorPort>;
    public content: IContent;
    public menuTemplate: IMenuTemplate[];
    public icon: string;

    public static defaultIcon = "icon-picture"

    constructor() {
        super();

        this.name = "Image";
        this.role = "internal.content.image";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.connectors =new Map<string, IConnectorPort>();
        this.makeFlowInAndOut();
        
        this.content = {
            resource: "new URL",
            contentType: "url",
            altText: "This is an image"
        }
        this.menuTemplate = connectionField(this);
        this.icon = _ImageObject.defaultIcon;

        makeObservable(this,{
            name:       observable,
            userDefinedProperties: observable,
            connectors: observable.shallow,
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
        return () => <div class="editor-component"></div>
    }
}

createModelSchema(_ImageObject, {})

export const plugInExport = exportClass(
    _ImageObject,
    "Image",
    "internal.content.image",
    _ImageObject.defaultIcon,
    true
);
