import { createRef, FunctionComponent, h } from "preact";
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { createModelSchema, object } from 'serializr';
import { useState } from "preact/hooks";
import { MenuTemplate, Text, CheckBox } from "preact-sidebar";
import { StoryPlugIn, IContent, StoryGraph, INGWebSProps, ContentSchema, exportClass, connectionField, nameField } from 'storygraph';
import { ObservableStoryObject } from "../helpers/ObservableStoryObject";

/**
 */
// @observable
export class AudioObject extends ObservableStoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: unknown;
    public content: IContent;
    public icon: string;
    // TODO: may be refactor these properties into a seperate object, e.g. userDefinedProperties?
    public playbackControls: boolean = true;
    public autoPlay: boolean = false;
    public loopable: boolean = false;
    public static defaultIcon = "icon-audio";  

    // TODO: are these all supposed to be private? I added the keyword…
    private audioWrapperId = this.id.concat(".audio-height");
    private idAudio = this.id.concat(".preview");
    private classList: string;
    private audioElement = createRef();
    private audioWrapper = createRef();

    constructor() {
        super();

        this.name = "Audio";
        this.role = "internal.content.audio";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeDefaultConnectors();
        this.classList = "";

        this.content = {
            resource: "https://www.hoerspielbox.de/wp-content/blogs.dir/sites/1/1-4-10012.mp3",
            contentType: "url",
            altText: "This is an audio file"
        }
        // this.menuTemplate = connectionField(this);
        this.icon = AudioObject.defaultIcon;
     
        makeObservable(this,{
            name:                   observable,
            userDefinedProperties:  observable,
            content:                observable,
            autoPlay:               observable,
            playbackControls:       observable,
            loopable:               observable,
            connectors:             computed,
            menuTemplate:           computed,
            updateName:             action,
            updateAudioURL:         action
        });       
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new Text("URL", {defaultValue: ""}, () => this.content.resource, (arg: string) => this.updateAudioURL(arg)),
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
            new CheckBox(
                "enable Looping",
                () => this.loopable,
                (sel: boolean) => {
                    runInAction(() => this.loopable = sel)
            }),
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }

    public updateAudioURL(newURL: string) {
        this.content.resource = newURL;
    }

    public updateName(name: string): void {
        this.name = name;
    }
    
    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
            // const [, setState] = useState({});    
            // this._rerender = () => {
            //     setState({});
            // };
           
            this.audioElement = createRef(); // TODO why does this help? why is the reference otherwise null here?
            this.audioWrapper = createRef();
            var that = this;
            const vid = <audio          
                id={this.idAudio}
                ref={this.audioElement} 
                type="audio/mpeg"  //several source types
                src={content?.resource}
                autoPlay={this.autoPlay}
                controls={this.playbackControls}
                preload="preload"
            ></audio>;          

            return <div id={this.audioWrapperId} ref={that.audioWrapper} class={this.classList}> {
                    this.modifiers.reduce((p,v) => (
                        v.modify(p)
                    ), vid)
                }
                </div>
        }
        return Comp
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component"></div>
    }

    public updateValue(): void {

    }
}

createModelSchema(AudioObject, {
    content: object(ContentSchema),
    autoPlay: true,
    loopable: true,
    scrollable: true,
    playbackControls: true
})

export const plugInExport = exportClass(
    AudioObject,
    "Audio",
    "internal.content.audio",
    AudioObject.defaultIcon,
    true
);

export const AudioPlugIn: StoryPlugIn = {
    name: "Audio",
    id: "internal.content.audio",
    public: true,
    icon:     AudioObject.defaultIcon,

    // package: {},
    constructor: AudioObject
}