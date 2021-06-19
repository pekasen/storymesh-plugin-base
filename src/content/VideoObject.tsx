import { createRef, FunctionComponent, h } from "preact";
import { action, computed, makeObservable, observable, runInAction } from 'mobx';
import { StoryPlugIn, INGWebSProps, exportClass, StoryGraph, ContentSchema, IContent, connectionField, nameField } from 'storygraph';
import { createModelSchema, object } from 'serializr';
import { useEffect } from "preact/hooks";
import { MenuTemplate, Text, CheckBox, HSlider } from "preact-sidebar";
import { Container } from "./Container";
import { ObservableStoryObject } from "../helpers/ObservableStoryObject";

/**
 */
// @observable
export class VideoObject extends ObservableStoryObject {
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
    public scrollableBackground: boolean = false;
    public muted: boolean = false;
    public scrollThroughSpeed: number = 100;
    public static defaultIcon = "icon-video";

    // TODO: are these all supposed to be private? I added the keyword…
    private myRequestAnimationFrame: number;
    private idVideo = this.id.concat(".preview");
    private classList: string;
    private videoElement = createRef();
    private videoWrapper: HTMLElement | undefined | null;

    constructor() {
        super();

        this.name = "Video";
        this.role = "internal.content.video";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeDefaultConnectors();
        this.classList = "";
        this.myRequestAnimationFrame = 0;

        this.content = {
            resource: "https://dl5.webmfiles.org/big-buck-bunny_trailer.webm",
            contentType: "url",
            altText: "This is a video"
        }
        // this.menuTemplate = connectionField(this);
        this.icon = VideoObject.defaultIcon;

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            content: observable,
            autoPlay: observable,
            playbackControls: observable,
            loopable: observable,
            scrollableBackground: observable,
            muted: observable,
            scrollThroughSpeed: observable,
            connectors: computed,
            menuTemplate: computed,
            updateName: action,
            updateVideoURL: action,
            updateScrollableBackground: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new Text("URL", { defaultValue: "" },
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
                "Set as scrollable container background",
                () => this.scrollableBackground,
                (sel: boolean) => {
                    runInAction(() => this.updateScrollableBackground(sel))
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
                    runInAction(() => {
                        this.scrollThroughSpeed = sel;
                        this.updateScrollableBackground(this.scrollableBackground);
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

    public updateScrollableBackground(newScrollableBackground: boolean) {
        this.scrollableBackground = newScrollableBackground;
        if (this.scrollableBackground) {
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
        const Comp: FunctionComponent<INGWebSProps> = ({ registry, content }) => {
            // const [, setState] = useState({});
            // this._rerender = () => {
            //     setState({});
            // };

            this.videoElement = createRef(); // TODO why does this help? why is the reference otherwise null here?

            const vid = <video class={this.classList}
                id={this.idVideo}
                ref={this.videoElement}
                type="video/webm; codecs='vp8, vorbis'"
                src={content?.resource}
                autoPlay={this.autoPlay}
                controls={this.playbackControls}
                loop={this.loopable}
                muted={this.muted}
                autobuffer="autobuffer"
                preload="preload"
            ></video>;

            useEffect(() => {
                const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                    window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                const cancelAnimationFrame = window.cancelAnimationFrame || window.mozCancelAnimationFrame;

                const that = this;
                function scrollPlay(): void {
                    if (that.parent) {
                        that.videoWrapper = document.getElementById(that.parent);
                        const parentNode = registry?.get(that.parent) as unknown as Container;
                        if (that.videoElement && that.videoElement.current && that.scrollableBackground && that.videoWrapper && !isNaN(that.videoElement.current.duration)) { //TODO: check why duration is sometimes NaN
                            that.videoElement.current.currentTime = that.videoElement.current.duration -
                                (that.videoWrapper?.getBoundingClientRect().bottom - that.videoElement.current.getBoundingClientRect().bottom)
                                / that.scrollThroughSpeed;
                            parentNode.height = (Math.floor(that.videoElement.current.duration * that.scrollThroughSpeed + that.videoElement.current.getBoundingClientRect().height)) + "px";
                            that.videoWrapper.style.height = parentNode.height;
                            that.myRequestAnimationFrame = requestAnimationFrame(scrollPlay);
                        }
                    }
                }
                if (this.scrollableBackground) {
                    requestAnimationFrame(scrollPlay);
                } else {
                    cancelAnimationFrame(this.myRequestAnimationFrame);
                }
            }, [this.scrollableBackground]);

            return this.modifiers.reduce((p, v) => (
                v.modify(p)
            ), vid)
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
    isScrollableBackground: true,
    playbackControls: true
})

export const plugInExport = exportClass(
    VideoObject,
    "Video",
    "internal.content.video",
    VideoObject.defaultIcon,
    true
);

export const VideoPlugIn: StoryPlugIn = {
    name: "Video",
    id: "internal.content.video",
    public: true,
    icon:     VideoObject.defaultIcon,

    // package: {},
    constructor: VideoObject
}
