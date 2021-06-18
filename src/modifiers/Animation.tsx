import Logger from "js-logger";
import { h } from "preact";
import { runInAction } from "mobx";
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema, object } from "serializr";
import { HTMLModifier, exportClass, ConnectorSchema, IConnectorPort, ReactionConnectorInPort, dropDownField, nameField } from "storygraph";
import { HSlider, MenuTemplate, CheckBox, Divider } from "preact-sidebar";
import { createUseStyles } from 'preact-jss-hook';
import { ModifierPlugIn } from "../../../storygraph/dist/StoryGraph/registry/PlugIn";

export class AnimationModifier extends HTMLModifier {

    public name: string = "Animation";
    public role: string = "internal.modifier.animation";
    public data: any = {
        toggle: true
    }
    public static defaultIcon = "icon-eye";
    public isAnimated: boolean;
    public hasAnimationLoop: boolean;
    public animationDuration: number;
    public animationDelay: number;
    public animationType: string; // blinker, ...
    public cssTimingFunction: string; // linear, ease-in, ...
    public startValue: string; // 50%, 360deg, #e5e5e5, ...
    public stopValue: any;
    public valueType: any; // %, deg, px
    public maxAnimationAmount: number = 100;
    public startAmount: any;
    public stopAmount: any;

    constructor() {
        super();

        this.startValue = "";
        this.stopValue = "";
        this.startAmount = "";
        this.stopAmount = "";
        this.animationDuration = 1;
        this.animationDelay = 0;
        this.animationType = "blinker";
        this.cssTimingFunction = "ease";
        this.valueType = "";
        this.isAnimated = false;
        this.hasAnimationLoop = false;

        makeObservable(this, {
            animationDuration: observable,
            animationDelay: observable,
            animationType: observable,
            startValue: observable,
            stopValue: observable,
            startAmount: observable,
            stopAmount: observable,
            cssTimingFunction: observable,
            valueType: observable,
            maxAnimationAmount: observable,
            isAnimated: observable,
            hasAnimationLoop: observable,
            updateAnimation: action,
            updateStartValue: action,
            updateStopValue: action,
            updateStartAmount: action,
            updateStopAmount: action,
            updateAnimationDuration: action,
            updateAnimationDelay: action,            
            updateValueType: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...super.menuTemplate,
            ...nameField(this),
            //TODO: Slider should be configurable to do half-steps
            new Divider(""),
            new HSlider(
                "Animation amount",
                {
                    min: 0,
                    max: this.maxAnimationAmount,
                    formatter: (val: number) => `${val}${this.valueType}`
                },
                () => this.startAmount,
                (startAmount: number) => this.updateStartAmount(startAmount)
            ),
            new Divider(""),
            new CheckBox(
                "Is animated",
                () => this.isAnimated,
                (sel: boolean) => {
                    runInAction(() => this.isAnimated = sel)
                }),
            new CheckBox(
                "Has animation loop",
                () => this.hasAnimationLoop,
                (sel: boolean) => {
                    runInAction(() => this.hasAnimationLoop = sel)
                }),
            new HSlider(
                "Animation cycle length",
                {
                    min: 0.5,
                    max: 10,
                    formatter: (val: number) => `${val}s`
                },
                () => this.animationDuration,
                (animationDuration: number) => this.updateAnimationDuration(animationDuration)
            ),
            new HSlider(
                "Animation delay",
                {
                    min: 0,
                    max: 10,
                    formatter: (val: number) => `${val}s`
                },
                () => this.animationDelay,
                (animationDelay: number) => this.updateAnimationDelay(animationDelay)
            ),
            ...dropDownField(
                this,
                () => ["blinker", "boop-left", "boop-right", "tada", "wobble"],
                () => this.animationType,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.animationType = selection);
                    this.updateValueType();
                }
            ),
            ...dropDownField(
                this,
                () => ["ease", "ease-in", "ease-out", "ease-in-out", "linear"],
                () => this.cssTimingFunction,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.cssTimingFunction = selection);
                }
            ),
            new HSlider(
                "From",
                {
                    min: 0,
                    max: this.maxAnimationAmount,
                    formatter: (val: number) => `${val}${this.valueType}`
                },
                () => this.startAmount,
                (startAmount: number) => this.updateStartAmount(startAmount)
            ),
            new HSlider(
                "To",
                {
                    min: 0,
                    max: this.maxAnimationAmount,
                    formatter: (val: number) => `${val}${this.valueType}`
                },
                () => this.stopAmount,
                (stopAmount: number) => this.updateStopAmount(stopAmount)
            )
        ];

        return ret;
    }

    public updateAnimation(newIsAnimated: boolean) {
        this.isAnimated = newIsAnimated;
    }

    public updateStartValue(newStartValue: string) {
        this.startValue = newStartValue;
    }

    public updateStopValue(newStopValue: string) {
        this.stopValue = newStopValue;
    }

    public updateStartAmount(newStartAmount: any) {
        this.startAmount = newStartAmount;
    }

    public updateStopAmount(newStopAmount: any) {
        this.stopAmount = newStopAmount;
    }

    public updateAnimationDuration(animationDuration: number) {
        this.animationDuration = animationDuration;
    }

    public updateAnimationDelay(animationDelay: number) {
        this.animationDelay = animationDelay;
    }

    public updateValueType() {
        if (this.animationType === "blink") {
            this.valueType = "%";
            this.maxAnimationAmount = 100;
        } 
    }

    private _trigger = () => {
        Logger.info("Trigger fired", this);
        this.data.toggle = !this.data.toggle
        // request rerendering
        this._connector.notificationCenter?.push(this._connector.parent + "/rerender");
        this.isAnimated = true;
    }
    private _connector = new ReactionConnectorInPort("reaction-in", this._trigger);

    public modify(element: h.JSX.Element): h.JSX.Element {
        this._connector.handleNotification = this._trigger;

        const useStyles = createUseStyles({
            '@keyframes blinker': {
                from: { opacity: this.startAmount + '%' },
                to: { opacity: this.stopAmount + '%' },
            },
            '@keyframes boop-right': {
                "0%": { transform: "translate(20px,0px)  rotate(3deg)" },
                "50%": { transform: "translate(120px,0px)  rotate(13deg)" },
                "100%": { transform: "translate(0px,0px)  rotate(0deg)" },
            },
            '@keyframes boop-left': {
                "0%": { transform: "translate(-20px,0px)  rotate(-3deg)" },
                "50%": { transform: "translate(-120px,0px)  rotate(-13deg)" },
                "100%": { transform: "translate(0px,0px)  rotate(0deg)" },
            },
            '@keyframes hue-rotate': {
                from: { transform: "translate(20px,0px)  rotate(3deg)" },
                to: { transform: "translate(120px,0px)  rotate(13deg)" },
            },
            '@keyframes wobble': {
                "0%": {
                    transform: "translate(0px,0px)  rotate(0deg)"
                },
                "15%": {
                    transform: "translate(-25px,0px)  rotate(-5deg)"
                },
                "30%": {
                    transform: "translate(20px,0px)  rotate(3deg)"
                },
                "45%": {
                    transform: "translate(-15px,0px)  rotate(-3deg)"
                },
                "60%": {
                    transform: "translate(10px,0px)  rotate(2deg)"
                },
                "75%": {
                    transform: "translate(-5px,0px)  rotate(-1deg)"
                },
                "100%": {
                    transform: "translate(-5px,0px)  rotate(-1deg)"
                }
            },
            '@keyframes tada': {
                '0%': {
                    transform: 'rotate(0deg) scaleX(1.00) scaleY(1.00)',
                },
                '10%': {
                    transform: 'rotate(-3deg) scaleX(0.80) scaleY(0.80)',
                },
                '20%': {
                    transform: 'rotate(-3deg) scaleX(0.80) scaleY(0.80)',
                },
                '30%': {
                    transform: 'rotate(3deg) scaleX(1.20) scaleY(1.20)',
                },
                '40%': {
                    transform: 'rotate(-3deg) scaleX(1.20) scaleY(1.20)',
                },
                '50%': {
                    transform: 'rotate(3deg) scaleX(1.20) scaleY(1.20)',
                },
                '60%': {
                    transform: 'rotate(-3deg) scaleX(1.20) scaleY(1.20)',
                },
                '70%': {
                    transform: 'rotate(3deg) scaleX(1.20) scaleY(1.20)',
                },
                '80%': {
                    transform: 'rotate(-3deg) scaleX(1.20) scaleY(1.20)',
                },
                '90%': {
                    transform: 'rotate(3deg) scaleX(1.20) scaleY(1.20)',
                },
                '100%': {
                    transform: 'rotate(0deg) scaleX(1.20) scaleY(1.20)'
                }
            },
            animated: {
                "animation-name": "$" + this.animationType,
                "animation-duration": this.animationDuration + "s",
                "animation-delay": this.animationDelay + "s",
                "animation-timing-function": this.cssTimingFunction,
                "animation-iteration-count": (this.hasAnimationLoop ? "infinite" : "1")
            }
        });

        const { classes } = useStyles();

        return <div id={`_${this.id}`} class={`${((this.isAnimated) ? classes.animated : "")}`}>
            {element}
        </div>
    }

    requestConnectors(): [string, IConnectorPort][] {
        return [[this._connector.id, this._connector]];
    }
}

export const AnimationModifierSchema = createModelSchema(AnimationModifier, {
    _connector: object(ConnectorSchema)
});

export const plugInExport = exportClass(
    AnimationModifier,
    "Animation",
    "internal.modifier.animation",
    "icon-eye",
    true
);

export const AnimationPlugIn: ModifierPlugIn = {
    name: "Animation",
    id: "internal.content.animation",
    public: true,
    icon: AnimationModifier.defaultIcon,

    // package: {},
    constructor: AnimationModifier
}