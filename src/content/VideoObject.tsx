import { createRef, FunctionComponent, h } from "preact";
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { INGWebSProps, exportClass, StoryGraph, ContentSchema, StoryObject, IContent, connectionField, nameField } from 'storygraph';
import { createModelSchema, object } from 'serializr';
import { useState, useEffect } from "preact/hooks";
import { MenuTemplate, Text, CheckBox, HSlider } from "preact-sidebar";

/**
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
    // TODO: may be refactor these properties into a seperate object, e.g. userDefinedProperties?
    public playbackControls: boolean = false;
    public autoPlay: boolean = false;
    public loopable: boolean = false;
    public scrollable: boolean = false;
    public setAsContainerBackground: boolean = false;
    public muted: boolean = false;
    public scrollThroughSpeed: number = 100;
    public static defaultIcon = "icon-video";  

    // TODO: are these all supposed to be private? I added the keyword…
    private myReq: number;
    private videoWrapperId = this.id.concat(".video-height");
    private idVideo = this.id.concat(".preview");
    private classList: string;
    private videoElement = createRef();
    private videoWrapper = createRef();

    constructor() {
        super();

        this.name = "Video";
        this.role = "internal.content.video";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeDefaultConnectors();
        this.classList = "";
        this.myReq = 0;

        this.content = {
            resource: "https://dl5.webmfiles.org/big-buck-bunny_trailer.webm",
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
            loopable:               observable,
            scrollable:             observable,
            setAsContainerBackground: observable,
            muted:                  observable,
            scrollThroughSpeed:     observable,
            connectors:             computed,
            menuTemplate:           computed,
            updateName:             action,
            updateVideoURL:         action,
            updateScrollable:       action
        });       
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new Text("URL", {defaultValue: ""}, 
                () => this.content.resource, 
                (arg: string) => this.updateVideoURL(arg)),
            new CheckBox(
                "Show Controls",
                () => this.playbackControls,
                (sel: boolean) => {
                    runInAction(() => this.playbackControls = sel)
            }),           
            new CheckBox(
                "Enable AutoPlay",
                () => this.autoPlay,
                (sel: boolean) => {
                    runInAction(() => this.autoPlay = sel)
            }),
            new CheckBox(
                "Enable Looping",
                () => this.loopable,
                (sel: boolean) => {
                    runInAction(() => this.loopable = sel)
            }),
            new CheckBox(
                "Muted",
                () => this.muted,
                (sel: boolean) => {
                    runInAction(() => this.muted = sel)
            }),
            new CheckBox(
                "Make Scrollable",
                () => this.scrollable,
                (sel: boolean) => {
                    runInAction(() => this.updateScrollable(sel))
            }),
            new CheckBox(
                "Set as container background",
                () => this.setAsContainerBackground,
                (sel: boolean) => {
                    runInAction(() => this.setAsContainerBackground = sel)
            }),
            new HSlider(
                "Scroll-through speed",
                {
                    min: 100,
                    max: 1000,
                    formatter: (val: number) => `${val}`
                },
                () => this.scrollThroughSpeed,
                (sel: number) => {
                    runInAction(() => 
                    {
                        this.scrollThroughSpeed = sel; 
                        this.updateScrollable(this.scrollable);
                    })
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

    public updateScrollable(newScrollable: boolean) {
        this.scrollable = newScrollable;    
        if (this.scrollable) {                                            
            if (this.videoElement && this.videoElement.current) {
                if (!this.classList.includes("bound-to-scroll")) {
                    this.classList = this.classList.concat(" bound-to-scroll").trim();
                }
            }      
        } else {
            if (this.videoElement && this.videoElement.current) {
                this.classList = this.classList.replace("bound-to-scroll", "").trim();
            }      
        }       
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
            const [, setState] = useState({});    
            this._rerender = () => {
                setState({});
            };
           
            this.videoElement = createRef(); // TODO why does this help? why is the reference otherwise null here?
            this.videoWrapper = createRef();
            var that = this;
            const vid = <video          
                id={this.idVideo}
                ref={this.videoElement} 
                type="video/webm; codecs='vp8, vorbis'"
                src={content?.resource}
                autoPlay={this.autoPlay}
                controls={this.playbackControls}
                loop={this.loopable}
                muted={this.muted}
                // autobuffer={true}
                preload="preload"
            ></video>;

            useEffect(() => {
                var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
               
                var that = this;
                function scrollPlay(): void {
                    if (that.videoElement && that.videoElement.current && that.scrollable && !isNaN(that.videoElement.current.duration)) { //TODO: check why duration is sometimes NaN
                        that.videoElement.current.currentTime =  that.videoElement.current.duration -
                        (that.videoWrapper.current.getBoundingClientRect().bottom - that.videoElement.current.getBoundingClientRect().bottom) 
                            / that.scrollThroughSpeed; 
                        that.videoWrapper.current.style.height = Math.floor(that.videoElement.current.duration * that.scrollThroughSpeed + that.videoElement.current.getBoundingClientRect().height);
                        that.myReq = requestAnimationFrame(scrollPlay);         
                    } 
                }  
                if (this.scrollable) {
                    requestAnimationFrame(scrollPlay);
                } else {
                    cancelAnimationFrame(this.myReq);
                }                 
            }, [this.scrollable]);     

            return <div id={this.videoWrapperId} ref={that.videoWrapper} class={this.classList}> {
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

createModelSchema(VideoObject, {
    content: object(ContentSchema),
    autoPlay: true,
    loopable: true,
    scrollable: true,
    playbackControls: true
})

export const plugInExport = exportClass(
    VideoObject,
    "Video",
    "internal.content.video",
    VideoObject.defaultIcon,
    true
);
