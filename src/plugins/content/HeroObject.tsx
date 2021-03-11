import { FunctionComponent, h } from "preact";
import { INGWebSProps, } from "../../renderer/utils/PlugInClassRegistry";
import { runInAction } from "mobx";
import { action, makeObservable, observable } from 'mobx';
import { StoryGraph } from 'storygraph';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';
import { HSlider, MenuTemplate, Text, CheckBox } from "preact-sidebar";
import Logger from "js-logger";

class _HeroObject extends StoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork?: StoryGraph;
    public content: any; // extend in storygraph?
    public icon: string;
    public valueType: any;
    public isVideo: boolean = false;

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
            isVideo: observable,
            content: observable,
            updateName: action,
            updateURL: action,
            updateAltText: action,
            updateHeadline: action,
            updateHeadlineWidth: action,
            updateFilterAmount: action,
            updateValueType: action,
            updateContentType: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new CheckBox(
                "Is video?",
                () => this.isVideo,
                (val: boolean) => {
                    runInAction(() => this.updateContentType(val))
                }),
            new Text("URL", { defaultValue: "" }, () => this.content.resource, (url: string) => this.updateURL(url)),
            new Text("Alt-Text", { defaultValue: "" }, () => this.content.altText, (text: string) => this.updateAltText(text)),
            new Text("Headline", { defaultValue: "" }, () => this.userDefinedProperties.text, (text: string) => this.updateHeadline(text)),
            new HSlider("Headline Width", {
                min: 0,
                max: 100,
                formatter: (val: number) => `${val}%`
            },
            () => this.userDefinedProperties.headlineWidth,
            (headlineWidth: number) => this.updateHeadlineWidth(headlineWidth)
            ),
            ...dropDownField(
                this,
                () => ["grayscale", "invert", "hue-rotate", "blur", "contrast"],
                () => this.userDefinedProperties.filterType,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.userDefinedProperties.filterType = selection), this.updateValueType();
                }
            ),
            new HSlider(
                "Filter Amount",
                {
                    min: 0,
                    max: 100,
                    formatter: (val: number) => `${val}${this.userDefinedProperties.filterValue}`
                },
                () => this.userDefinedProperties.filterAmount,
                (filterAmount: number) => this.updateFilterAmount(filterAmount)
            ),
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }

    public updateURL(newURL: string) {
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

    public updateContentType(newContentType: boolean) {
        this.isVideo = newContentType;
        if(this.isVideo){
            this.content.resource = "https://dl5.webmfiles.org/big-buck-bunny_trailer.webm";
        } else {
            this.content.resource = "https://source.unsplash.com/random/1920x1080";
        }
    }   

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({ content }) => {
            if(this.isVideo){
            return (
                <div class="hero">
                <video autoplay="true" preload="preload" loop="true" muted src={content?.resource} style={`filter:${this.userDefinedProperties.filterType}(${this.userDefinedProperties.filterAmount}${this.userDefinedProperties.filterValue});`}></video>
                <h1 style={`width:${this.userDefinedProperties.headlineWidth}%`}>{this.userDefinedProperties.text}</h1>
            </div>
            );
            } else {
                return (
                    <div class="hero">
                    <img src={content?.resource} alt={content?.altText} style={`filter:${this.userDefinedProperties.filterType}(${this.userDefinedProperties.filterAmount}${this.userDefinedProperties.filterValue});`}></img>
                    <h1 style={`width:${this.userDefinedProperties.headlineWidth}%`}>{this.userDefinedProperties.text}</h1>
                </div>
                );
            }
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