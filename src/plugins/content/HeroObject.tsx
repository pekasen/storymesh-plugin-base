import { FunctionComponent, h } from "preact";
import { INGWebSProps, IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { runInAction } from "mobx";
import { action, makeObservable, observable } from 'mobx';
import { DataConnectorInPort, FlowConnectorInPort, FlowConnectorOutPort, IConnectorPort, StoryGraph } from 'storygraph';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';

class _HeroObject extends StoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork?: StoryGraph;
    public content: IContent;
    public icon: string;
    public valueType: any;

    public static defaultIcon = "icon-star"

    constructor() {
        super();

        this.name = "Hero";
        this.role = "internal.content.hero";
        this.isContentNode = true;
        this.makeDefaultConnectors();

        this.content = {
            resource: "https://source.unsplash.com/random/1920x1080",
            contentType: "url",
            altText: "This is an image",
        }
        this.valueType = {
            percent: "%",
            px: "px",
            deg: "deg"
        }
        this.userDefinedProperties = {
            text: "Headline goes here",
            filterAmount: 0,
            headlineWidth: 100,
            filterType: "grayscale",
            filterValue: "%"
        }
        this.icon = _HeroObject.defaultIcon;

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            // connectors:             observable.shallow,
            content: observable,
            updateName: action,
            updateImageURL: action,
            updateAltText: action,
            updateHeadline: action,
            updateHeadlineWidth: action,
            updateFilterAmount: action,
            updateValueType: action
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
            {
                label: "Alt-Text",
                type: "text",
                value: () => this.content.altText,
                valueReference: (altText: string) => { this.updateAltText(altText) }
            },
            {
                label: "Headline",
                type: "textarea",
                value: () => this.userDefinedProperties.text,
                valueReference: (text: string) => { this.updateHeadline(text) }
            },
            {
                label: "Headline width",
                type: "hslider",
                options: {
                    min: 0,
                    max: 100,
                    formatter: (val: number) => `${val}%`
                },
                value: () => this.userDefinedProperties.headlineWidth,
                valueReference: (headlineWidth: number) => this.updateHeadlineWidth(headlineWidth)
            },
            ...dropDownField(
                this,
                () => ["grayscale", "invert", "hue-rotate", "blur", "contrast"],
                () => this.userDefinedProperties.filterType,
                (selection: string) => {
                    console.log(selection);
                    runInAction(() => this.userDefinedProperties.filterType = selection), this.updateValueType();
                }
            ),
            {
                label: "Filter Amount",
                type: "hslider",
                options: {
                    min: 0,
                    max: 100,
                    formatter: (val: number) => `${val}${this.userDefinedProperties.filterValue}`
                },
                value: () => this.userDefinedProperties.filterAmount,
                valueReference: (filterAmount: number) => this.updateFilterAmount(filterAmount)
            },
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }

    public updateImageURL(newURL: string) {
        this.content.resource = newURL;
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public updateAltText(altText: string): void {
        this.content.altText = altText;
    }

    public updateHeadline(text: string) {
        this.userDefinedProperties.text = text;
    }

    public updateHeadlineWidth(headlineWidth: number) {
        this.userDefinedProperties.headlineWidth = headlineWidth;
    }

    public updateFilterAmount(filterAmount: number) {
        this.userDefinedProperties.filterAmount = filterAmount;
    }

    public updateValueType(){
        if(this.userDefinedProperties.filterType === "hue-rotate"){
            this.userDefinedProperties.filterValue = this.valueType.deg;
        } else if(this.userDefinedProperties.filterType === "blur"){
            this.userDefinedProperties.filterValue = this.valueType.px;
        } else {
            this.userDefinedProperties.filterValue = this.valueType.percent;
        }
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({ content }) => {
            return (
                <div class="hero">
                    <img src={content?.resource} alt={content?.altText} style={`filter:${this.userDefinedProperties.filterType}(${this.userDefinedProperties.filterAmount}${this.userDefinedProperties.filterValue});`}></img>
                    <h1 style={`width:${this.userDefinedProperties.headlineWidth}%`}>{this.userDefinedProperties.text}</h1>
                </div>
            );
        }
        return Comp
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component"></div>
    }
}

createModelSchema(_HeroObject, {})

export const plugInExport = exportClass(
    _HeroObject,
    "Hero",
    "internal.content.hero",
    _HeroObject.defaultIcon,
    true
);