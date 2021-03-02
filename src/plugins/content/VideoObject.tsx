import { FunctionComponent, h } from "preact";
import { INGWebSProps } from "../../renderer/utils/PlugInClassRegistry";
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { StoryGraph } from 'storygraph';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';
import { useState } from "preact/hooks";
import { MenuTemplate, Text, CheckBox } from "preact-sidebar";

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
class VideoObject extends StoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: unknown;
    public childNetwork?: StoryGraph;
    public content: IContent;
    public icon: string;
    public playbackControls: boolean = false;
    public autoPlay: boolean = false;

    public static defaultIcon = "icon-video"

    constructor() {
        super();

        this.name = "Video";
        this.role = "internal.content.video";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeDefaultConnectors();
        
        this.content = {
            resource: "https://cdn.videvo.net/videvo_files/video/premium/2020-08/small_watermarked/Smart_City_Walking_preview.webm",
            contentType: "url",
            altText: "This is a video"
        }
        // this.menuTemplate = connectionField(this);
        this.icon = VideoObject.defaultIcon;

        makeObservable(this,{
            name:                   observable,
            userDefinedProperties:  observable,
            content:                observable,
            autoPlay:               observable,
            playbackControls:       observable,
            connectors:             computed,
            menuTemplate:           computed,
            updateName:             action,
            updateVideoURL:         action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new Text("URL", {defaultValue: ""}, () => this.content.resource, (arg: string) => this.updateVideoURL(arg)),
            new CheckBox(
                "show Controls",
                () => this.playbackControls,
                (sel: boolean) => {
                runInAction(() => this.playbackControls = sel)
            }),
            new CheckBox(
                "enable AutoPlay",
                () => this.autoPlay,
                (sel: boolean) => {
                runInAction(() => this.autoPlay = sel)
            }),
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }

    public updateVideoURL(newURL: string) {
        this.content.resource = newURL;
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {

            const [, setState] = useState({});

            this._rerender = () => {
                setState({});
            }

            const vid = <video
                id={this.id}
                class="video"
                src={content?.resource}
                autoPlay={this.autoPlay}
                controls={this.playbackControls}
            ></video>;

            return this.modifiers.reduce((p,v) => (
                v.modify(p)
            ), vid);
        }
        return Comp
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component"></div>
    }

    public updateValue(): void {

    }
}

createModelSchema(VideoObject, {})

export const plugInExport = exportClass(
    VideoObject,
    "Video",
    "internal.content.video",
    VideoObject.defaultIcon,
    true
);
