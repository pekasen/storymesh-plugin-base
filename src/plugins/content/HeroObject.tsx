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
    public content: IContent;
    public icon: string;
    public valueType: any;
    public contentType: string;
    public maxFilterAmount: number = 100;
    public variableFilterAmounts: any;
    public muted: boolean = true;
    public loop: boolean = true;

    public static defaultIcon = "icon-star"

    constructor() {
        super();

        this.name = "Hero";
        this.role = "internal.content.hero";
        this.isContentNode = true;
        this.makeDefaultConnectors();

        this.contentType = "Image";

        this.content = {
            resource: "https://source.unsplash.com/random/1920x1080",
            contentType: "url",
            altText: "",
        }
        this.valueType = {
            percent: "%",
            px: "px",
            deg: "deg"
        }
        this.variableFilterAmounts = {
            percent: 100,
            degree: 360,
            pixels: 50
        }
        this.userDefinedProperties = {
            text: "",
            filterAmount: 0,
            headlineWidth: "",
            filterType: "grayscale",
            filterValue: "%"
        }
        this.icon = _HeroObject.defaultIcon;

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            // connectors:             observable.shallow,
            contentType: observable,
            content: observable,
            maxFilterAmount: observable,
            variableFilterAmounts: observable,
            valueType: observable,
            muted: observable,
            loop: observable,
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
            ...dropDownField(
                this,
                () => ["Image", "Video"],
                () => this.userDefinedProperties.contentType,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.contentType = selection), this.updateContentType(selection);
                }
            ),
            new Text("URL", { placeHolder: "" }, () => this.content.resource, (url: string) => this.updateURL(url)), 
            new Text("Alt-Text", { placeHolder: "describe your image precisely" }, () => this.content.altText, (text: string) => this.updateAltText(text)),
            new Text("Headline", { placeHolder: "Enter a headline..." }, () => this.userDefinedProperties.text, (text: string) => this.updateHeadline(text)),
            new Text("Maximum headline width", { placeHolder: "insert value in px, percent or vw" }, () => this.userDefinedProperties.headlineWidth, (text: string) => this.updateHeadlineWidth(text)),
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
                    max: this.maxFilterAmount,
                    formatter: (val: number) => `${val}${this.userDefinedProperties.filterValue}`
                },
                () => this.userDefinedProperties.filterAmount,
                (filterAmount: number) => this.updateFilterAmount(filterAmount)
            ),
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        if (this.contentType == "Video"){
            ret.splice(3, 1,             
                new CheckBox(
                "Mute",
                () => this.muted,
                (sel: boolean) => {
                    runInAction(() => this.muted = sel)
            }), 
            new CheckBox(
                "Loop",
                () => this.loop,
                (sel: boolean) => {
                    runInAction(() => this.loop = sel)
            }),);
        }
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

    public updateHeadlineWidth(headlineWidth: string) {
        this.userDefinedProperties.headlineWidth = headlineWidth;
    }

    public updateValueType(){
        if(this.userDefinedProperties.filterType === "hue-rotate"){
            this.userDefinedProperties.filterValue = this.valueType.deg;
            this.maxFilterAmount = this.variableFilterAmounts.degree;
        } else if(this.userDefinedProperties.filterType === "blur"){
            this.userDefinedProperties.filterValue = this.valueType.px;
            this.maxFilterAmount = this.variableFilterAmounts.pixels;
        } else {
            this.userDefinedProperties.filterValue = this.valueType.percent;
            this.maxFilterAmount = this.variableFilterAmounts.percent;
        }
    }

    public updateFilterAmount(filterAmount: number) {
        this.userDefinedProperties.filterAmount = filterAmount;
    }

    public updateContentType(newContentType: string) {
        this.contentType = newContentType;
        if(this.contentType === "Video"){
            this.content.resource = "https://dl5.webmfiles.org/big-buck-bunny_trailer.webm";
        } else {
            this.content.resource = "https://source.unsplash.com/random/1920x1080";
        }
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({ content }) => {

            const headline = <h1 style={`max-width:${this.userDefinedProperties.headlineWidth}`}>{this.userDefinedProperties.text}</h1>;
            const image = <img src={content?.resource} 
                               alt={content?.altText} 
                               style={`filter:${this.userDefinedProperties.filterType}(${this.userDefinedProperties.filterAmount}${this.userDefinedProperties.filterValue});`}
                               ></img>
            const video = <video autoplay="true" 
                                 preload="preload"
                                 autobuffer="autobuffer"
                                 muted={this.muted} 
                                 loop={this.loop} 
                                 src={content?.resource} 
                                 style={`filter:${this.userDefinedProperties.filterType}(${this.userDefinedProperties.filterAmount}${this.userDefinedProperties.filterValue});`}
                                 ></video>                   

            return <div class="hero">
                {this.contentType == "Video" ? video : image}
                {headline}
            </div>
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