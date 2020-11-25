import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { INGWebSProps, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";

import { action, IReactionDisposer, makeObservable, observable, reaction } from 'mobx';
import { IConnectorPort, StoryGraph } from 'storygraph';
import { AbstractStoryObject } from './helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField } from './helpers/plugInHelpers';
import { exportClass } from './helpers/exportClass';

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
    public icon: string;

    public static defaultIcon = "icon-picture"

    constructor() {
        super();

        this.name = "Image";
        this.role = "content";
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
        this.menuTemplate = connectionField(this);
        this.icon = _ImageObject.defaultIcon;

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
        return () => <div class="editor-component"></div>
    }
}

export const plugInExport = exportClass(
    _ImageObject,
    "Image",
    "internal.content.image",
    _ImageObject.defaultIcon,
    true
);
