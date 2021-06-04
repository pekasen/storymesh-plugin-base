import Logger from "js-logger";
import { h } from "preact";
import { runInAction } from "mobx";
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema, object } from "serializr";
import { HTMLModifier, exportClass, IConnectorPort, ReactionConnectorInPort, ConnectorSchema, dropDownField, nameField } from "storygraph";
import { HSlider, MenuTemplate, CheckBox, Divider } from "preact-sidebar";
import { createUseStyles } from 'preact-jss-hook';

export class FilterModifier extends HTMLModifier {

    public name: string = "Filter";
    public role: string = "internal.modifier.filter";
    public data: any = {
        toggle: true
    }
    public isAnimated: boolean;
    public hasAnimationLoop: boolean;
    public animationDuration: number;
    public animationDelay: number;
    public animationOption: string; // blinker, ...
    public cssTimingFunction: string; // linear, ease-in, ...
    public startValue: string; // 50%, 360deg, #e5e5e5, ...
    public stopValue: any;
    public filterOption: string; // grayscale, blur, ...
    public valueType: any; // %, deg, px
    public maxFilterAmount: number = 100;
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
        this.animationOption = "hue-rotate";
        this.cssTimingFunction = "ease";
        this.filterOption = "grayscale";
        this.valueType = "";
        this.isAnimated = false;
        this.hasAnimationLoop = false;

        makeObservable(this, {
            animationDuration: observable,
            animationDelay: observable,
            animationOption: observable,
            startValue: observable,
            stopValue: observable,
            startAmount: observable,
            stopAmount: observable,
            cssTimingFunction: observable,
            filterOption: observable,
            valueType: observable,
            maxFilterAmount: observable,
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
            ...dropDownField(
                this,
                () => ["grayscale", "invert", "hue-rotate", "blur", "contrast", "opacity"],
                () => this.filterOption,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.filterOption = selection);
                    this.updateValueType();
                    this.updateStartValue(selection);
                    this.updateStopValue(selection);
                    console.log(this.valueType);
                }
            ),
            new HSlider(
                "Filter amount",
                {
                    min: 0,
                    max: this.maxFilterAmount,
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
                () => ["blinker", "hue-rotate"],
                () => this.animationOption,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.animationOption = selection);
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
                    max: this.maxFilterAmount,
                    formatter: (val: number) => `${val}${this.valueType}`
                },
                () => this.startAmount,
                (startAmount: number) => this.updateStartAmount(startAmount)
            ),
            new HSlider(
                "To",
                {
                    min: 0,
                    max: this.maxFilterAmount,
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
        if (this.filterOption === "hue-rotate") {
            this.valueType = "deg";
            this.maxFilterAmount = 360;
        } else if (this.filterOption === "blur") {
            this.valueType = "px";
            this.maxFilterAmount = 50;
        } else {
            this.valueType = "%";
            this.maxFilterAmount = 100;
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
        let cssStartOutput: string;
        let cssEndOutput: string;
        cssStartOutput = `${this.filterOption}(${this.startAmount}${this.valueType})`;
        cssEndOutput = `${this.filterOption}(${this.stopAmount}${this.valueType})`;

        const useStyles = createUseStyles({
            '@keyframes blinker': {
                from: { opacity: this.startAmount + this.valueType},
                to: { opacity: this.stopAmount + this.valueType }
            },
            '@keyframes hue-rotate': {
                '0%': {
                    filter: "hue-rotate(" + this.startAmount + this.valueType + ")"
                },
                "50%": {
                    filter: "hue-rotate(100deg)"
                },
                "100%": {
                    filter: "hue-rotate(" + this.stopAmount + this.valueType + ")"
                }
            },
            animated: {
                "animation-name": "$" + this.animationOption,
                "animation-duration": this.animationDuration + "s",
                "animation-delay": this.animationDelay + "s",
                "animation-timing-function": this.cssTimingFunction,
                "animation-iteration-count": (this.hasAnimationLoop ? "infinite" : "1")
            },
            active: JSON.parse('{"filter": "' + cssStartOutput + '" }'),
            inactive: JSON.parse('{"filter": "' + cssEndOutput + '" }'),
        });

        const { classes } = useStyles();

        return <div id={`_${this.id}`} class={`${((this.isAnimated) ? classes.animated : "")} ${((this.data.toggle) ? classes.inactive : classes.active)}`}>
            {element}
        </div>
    }

    requestConnectors(): [string, IConnectorPort][] {
        return [[this._connector.id, this._connector]];
    }
}

export const FilterModifierSchema = createModelSchema(FilterModifier, {
    _connector: object(ConnectorSchema)
});

export const plugInExport = exportClass(
    FilterModifier,
    "Filter",
    "internal.modifier.filter",
    "icon-eye",
    true
);
