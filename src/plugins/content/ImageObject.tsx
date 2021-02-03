import { FunctionComponent, h } from "preact";
import { INGWebSProps, IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";

import { action, makeObservable, observable } from 'mobx';
import { IConnectorPort, StoryGraph } from 'storygraph';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';
import { CSSModifier } from "../helpers/CSSModifier";

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
    public userDefinedProperties: unknown;
    public childNetwork?: StoryGraph;
    public content: IContent;
    public icon: string;

    public static defaultIcon = "icon-picture"

    constructor() {
        super();

        this.name = "Image";
        this.role = "internal.content.image";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeFlowInAndOut();
        
        this.content = {
            resource: "https://www.dafont.com/img/illustration/s/o/something.jpg",
            contentType: "url",
            altText: "This is an image"
        }
        // this.menuTemplate = connectionField(this);
        this.icon = _ImageObject.defaultIcon;

        makeObservable(this,{
            name:                   observable,
            userDefinedProperties:  observable,
            // connectors:             observable.shallow,
            content:                observable,
            updateName:             action,
            updateImageURL:         action
        });
    }

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
            ...nameField(this),
            {
                label: "url",
                value: () => this.content.resource,
                valueReference: (url: string) => this.updateImageURL(url),
                type: "text"
            },
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }


    public get connectors(): Map<string, IConnectorPort> {
        const map = super.connectors;
        [
            {
                name: "data-in",
                type: "data",
                direction: "in"
            },
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
        ].forEach(e => map.set(e.name, e as IConnectorPort));
        return map;
    }

    public updateImageURL(newURL: string) {
        this.content.resource = newURL;
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
            const img = <img src={content?.resource}></img>;
            return this.modifiers.reduce((p,v) => (
                v.modify(p)
            ), img);
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
