import Logger from "js-logger";
import { createRef, h } from "preact";
import { runInAction } from "mobx";
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema, object } from "serializr";
import { IConnectorPort, ReactionConnectorInPort } from "storygraph";
import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";
import { HSlider, MenuTemplate, Text, CheckBox, ColorPicker, Divider, DropDown } from "preact-sidebar";
import { createUseStyles } from 'preact-jss-hook';

export class FilterModifier extends HMTLModifier {

    public name: string = "";
    public role: string = "internal.modifier.filter";
    public data: any = {
        toggle: true
    }
    public filterProperty: string; // transform, color, width, ...
    public filterDuration: number;
    public filterDelay: number;
    public cssTimingFunction: string; // linear, ease-in, ...
    public overrideExistingValues: boolean = false;
    public startValue: string; // 50%, 360deg, #e5e5e5, ...
    public stopValue: any;
    public transformOption: string; // rotate, scale, translateX, ...
    public filterOption: string; // grayscale, blur, ...
    public valueType: any; // %, deg, px
    public maxFilterAmount: number = 100;
    public startAmount: any;
    public stopAmount: any;
    refElement = createRef();

    constructor() {
        super();

        this.filterProperty = "";
        this.startValue = "";
        this.stopValue = "";
        this.filterDuration = 1;
        this.filterDelay = 0;
        this.cssTimingFunction = "ease";
        this.transformOption = "rotate";
        this.filterOption = "grayscale";
        this.valueType = "";

        makeObservable(this, {
            filterProperty: observable,
            filterDuration: observable,
            filterDelay: observable,
            startValue: observable,
            stopValue: observable,
            cssTimingFunction: observable,
            transformOption: observable,
            filterOption: observable,
            valueType: observable,
            maxFilterAmount: observable,
            updateFilterProperty: action,
            updateStartValue: action,
            updateStopValue: action,
            updateStartAmount: action,
            updateStopAmount: action,
            updateFilterDuration: action,
            updateFilterDelay: action,
            updateValueType: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...super.menuTemplate,
            ...nameField(this),
            ...dropDownField(
                this,
                () => ["transform", "filter", "background-color", "color", "width"],
                () => this.filterProperty,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.filterProperty = selection)
                }
            ),
            //TODO: Slider should be configurable to do half-steps
            new Divider(""),
            new HSlider(
                "Duration",
                {
                    min: 0.5,
                    max: 10,
                    formatter: (val: number) => `${val}s`
                },
                () => this.filterDuration,
                (filterDuration: number) => this.updateFilterDuration(filterDuration)
            ),
            new HSlider(
                "Delay",
                {
                    min: 0,
                    max: 10,
                    formatter: (val: number) => `${val}s`
                },
                () => this.filterDelay,
                (filterDelay: number) => this.updateFilterDelay(filterDelay)
            ),
            ...dropDownField(
                this,
                () => ["ease", "ease-in", "ease-out", "ease-in-out" , "linear"],
                () => this.cssTimingFunction,
                (selection: string) => {
                    Logger.info(selection);
                    runInAction(() => this.cssTimingFunction = selection);
                }
            ),
            new CheckBox(
                "Override existing css?",
                () => this.overrideExistingValues,
                (sel: boolean) => {
                    runInAction(() => this.overrideExistingValues = sel)
            }),
        ];
        switch (this.filterProperty) {
            case "transform":
                ret.splice(4, 0,
                    ...dropDownField(
                        this,
                        () => ["translateX", "translateY", "rotate", "scale", "skewX", "skewY"],
                        () => this.transformOption,
                        (selection: string) => {
                            Logger.info(selection);
                            runInAction(() => this.transformOption = selection);
                        }
                    ),
                    new Text("Start amount", { placeHolder: "100%, 20px, 50deg, ..." }, () => this.startAmount, (arg: string) => this.updateStartAmount(arg)),
                    new Text("Stop amount", { placeHolder: "100%, 20px, 50deg, ..." }, () => this.stopAmount, (arg: string) => this.updateStopAmount(arg)),
                    );
                    break;
            case "filter":
                ret.splice(4, 0,
                    ...dropDownField(
                        this,
                        () => ["grayscale", "invert", "hue-rotate", "blur", "contrast", "opacity"],
                        () => this.filterOption,
                        (selection: string) => {
                            Logger.info(selection);
                            runInAction(() => this.filterOption = selection),
                            this.updateValueType();
                            this.updateStartValue(selection);
                            this.updateStopValue(selection);
                            console.log(this.valueType);
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
                    ))
                break;
            case "color":
                case "background-color":
                    ret.splice(4, 0,
                        new ColorPicker(
                            "From color",
                            () => this.startValue,
                            (color: string) => this.updateStartValue(color)
                        ),
                        new ColorPicker(
                            "To color",
                            () => this.stopValue,
                            (color: string) => this.updateStopValue(color)
                        ))
                    break;
            case "width":
                ret.splice(4, 0,
                    new Text("From", { placeHolder: "100%" }, () => this.startValue, (arg: string) => this.updateStartValue(arg)),
                    new Text("To", { placeHolder: "50%" }, () => this.stopValue, (arg: string) => this.updateStopValue(arg)))
                break;
            default:
                return ret;
        }
            
        return ret;
    }

    public updateFilterProperty(newProperty: string) {
        this.filterProperty = newProperty;
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

    public updateFilterDuration(filterDuration: number) {
        this.filterDuration = filterDuration;
    }

    public updateFilterDelay(filterDelay: number) {
        this.filterDelay = filterDelay;
    }

    //TODO: Update value types for transforms as well
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
        this._connector.notificationCenter?.push(this._connector.parent + "/rerender")
    }
    private _connector = new ReactionConnectorInPort("reaction-in", this._trigger);

    public modify(element: h.JSX.Element): h.JSX.Element {
        this._connector.handleNotification = this._trigger;
        let cssStartOutput: string;
        let cssEndOutput: string;
        if(this.filterProperty == "color" || this.filterProperty == "background-color" || this.filterProperty == "width"){
            cssStartOutput = this.startValue;
            cssEndOutput = this.stopValue;
        } else if(this.filterProperty == "filter"){
            cssStartOutput = `${this.filterOption}(${this.startAmount}${this.valueType})`;
            cssEndOutput = `${this.filterOption}(${this.stopAmount}${this.valueType})`;
        } else {
            //TODO: Add multi value shorthands (skew, matrix, ...)?
            //TODO: Re-add {this.valueType}
            cssStartOutput = `${this.transformOption}(${this.startAmount})`;
            cssEndOutput = `${this.transformOption}(${this.stopAmount})`;
        }

        const useStyles = createUseStyles({
            filterBase: {
                transition: this.filterProperty + " " + this.filterDuration + "s " + this.cssTimingFunction + " " + (this.filterDelay > 0 ? this.filterDelay + "s" : ""),                
            },
            active: JSON.parse('{"' + this.filterProperty + ' ": "' + cssStartOutput.toString() + '" }'),
            inactive: JSON.parse('{"' + this.filterProperty + ' ": "' + cssEndOutput.toString() + '" }'),     
          });          

       const { classes } = useStyles();

        return <div ref={this.refElement}>
            <div id={`_${this.id}`} class={`${classes.filterBase} ${((this.data.toggle) ? classes.inactive : classes.active )}`}>
                {element}
            </div>
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
    "icon-mouse",
    true
);
