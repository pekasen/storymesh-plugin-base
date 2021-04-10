import { createRef, FunctionComponent, h } from "preact";
import { INGWebSProps } from "../../renderer/utils/PlugInClassRegistry";
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { StoryGraph } from 'storygraph';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';
import { useRef, useState, useEffect } from "preact/hooks";
import { MenuTemplate, Text, CheckBox, HSliderMenuItem, HSlider } from "preact-sidebar";

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
    public playbackControls: boolean = false;
    public autoPlay: boolean = false;
    public loopable: boolean = false;
    public scrollable: boolean = false;
    public static defaultIcon = "icon-video";  
    public scrollThroughSpeed: number = 100;
    myReq: number;
    videoWrapperId = this.id.concat(".video-height");
    videoWrapperHeight: number;
    idVideo = this.id.concat(".preview");
    classList: string;
    videoElement = createRef();
    videoWrapper = createRef();

    constructor() {
        super();

        this.name = "Video";
        this.role = "internal.content.video";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeDefaultConnectors();
        this.classList = "";
        this.myReq = 0;
        this.videoWrapperHeight = 0;

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
            new CheckBox(
                "enable Looping",
                () => this.loopable,
                (sel: boolean) => {
                    runInAction(() => this.loopable = sel)
            }),
            new CheckBox(
                "make Scrollable",
                () => this.scrollable,
                (sel: boolean) => {
                    runInAction(() => this.updateScrollable(sel))
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
                this.videoWrapperHeight = (Math.floor(this.videoElement.current.duration) * this.scrollThroughSpeed);
            }      
        } else {
            if (this.videoElement && this.videoElement.current) {
                this.classList = this.classList.replace("bound-to-scroll", "").trim();
                this.videoWrapperHeight = this.videoElement.current.height;    
            }      
        }        
    }
    
    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
            console.log("vidref", this.videoElement);
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
                autobuffer="autobuffer"
                preload="preload"
            ></video>;

            console.log("wrapper", that.videoElement);
            useEffect(() => {
                var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                            window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                var cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;
               
                var that = this;
                function scrollPlay(): void {
                    if (that.videoElement && that.videoElement.current) {
                        console.log(that.videoElement.current.duration -
                            Math.round((that.videoWrapper.current.getBoundingClientRect().bottom - that.videoElement.current.getBoundingClientRect().top) 
                                / that.scrollThroughSpeed));
                        that.videoElement.current.currentTime = that.videoElement.current.duration -
                            Math.round((that.videoWrapper.current.getBoundingClientRect().bottom - that.videoElement.current.getBoundingClientRect().top) 
                                / that.scrollThroughSpeed); // TODO fix offset
                        that.myReq = requestAnimationFrame(scrollPlay);         
                    } 
                }  
                if (this.scrollable) {
                    requestAnimationFrame(scrollPlay);
                } else {
                    cancelAnimationFrame(this.myReq);
                }                 
            }, [this.scrollable]);     

            return <div id={this.videoWrapperId} ref={that.videoWrapper} class={this.classList} style={"height: " + this.videoWrapperHeight}> {
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

createModelSchema(VideoObject, {})

export const plugInExport = exportClass(
    VideoObject,
    "Video",
    "internal.content.video",
    VideoObject.defaultIcon,
    true
);
