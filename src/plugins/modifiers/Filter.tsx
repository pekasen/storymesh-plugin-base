import Logger from "js-logger";
import { h } from "preact";
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

    constructor() {
        super();

        this.startValue = "";
        this.stopValue = "";
        this.startAmount = "";
        this.stopAmount = "";
        this.filterDuration = 1;
        this.filterDelay = 0;
        this.cssTimingFunction = "ease";
        this.transformOption = "rotate";
        this.filterOption = "grayscale";
        this.valueType = "";

        makeObservable(this, {
            filterDuration: observable,
            filterDelay: observable,
            startValue: observable,
            stopValue: observable,
            startAmount: observable,
            stopAmount: observable,
            cssTimingFunction: observable,
            transformOption: observable,
            filterOption: observable,
            valueType: observable,
            maxFilterAmount: observable,
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
            )
        ];
            
        return ret;
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
        cssStartOutput = `${this.filterOption}(${this.startAmount}${this.valueType})`;
        cssEndOutput = `${this.filterOption}(${this.stopAmount}${this.valueType})`;

        const useStyles = createUseStyles({
            filterBase: {
                transition: this.filterDuration + "s " + this.cssTimingFunction + " " + (this.filterDelay > 0 ? this.filterDelay + "s" : ""),                
            },
            active: JSON.parse('{"filter": "' + cssStartOutput.toString() + '" }'),
            inactive: JSON.parse('{"filter": "' + cssEndOutput.toString() + '" }'),  
          });          

       const { classes } = useStyles();

        return <div id={`_${this.id}`} class={`${classes.filterBase} ${((this.data.toggle) ? classes.inactive : classes.active )}`}>
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
    "icon-mouse",
    true
);
