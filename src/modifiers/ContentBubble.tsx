import Logger from "js-logger";
import { h } from "preact";
import { runInAction } from "mobx";
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema, object } from "serializr";
import { exportClass, HTMLModifier, IConnectorPort, ReactionConnectorInPort, ConnectorSchema, dropDownField, nameField, ModifierPlugIn } from "storygraph";
import { HSlider, MenuTemplate, Text, CheckBox, ColorPicker, Divider } from "preact-sidebar";
import { createUseStyles } from 'preact-jss-hook';

export class _ContentBubble extends HTMLModifier {

    public name: string = "";
    public role: string = "internal.modifier.objectbackground";
    public data: any = {
        toggle: true
    }
    public static defaultIcon = "icon-eye";
    public padding: number;
    public textColor: string;
    public backgroundColor: string;

    constructor() {
        super();

        this.padding = 10;
        this.textColor = "#fff";
        this.backgroundColor = "#242424";

        makeObservable(this, {
            padding: observable,
            textColor: observable,
            backgroundColor: observable,
            updatePadding: action,
            updateTextColor: action,
            updateBackgroundColor: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...super.menuTemplate,
            ...nameField(this),
            new Divider(""),
            new HSlider(
                "Padding",
                {
                    min: 0,
                    max: 100,
                    formatter: (val: number) => `${val}px`
                },
                () => this.padding,
                (padding: number) => this.updatePadding(padding)
            ),
            new ColorPicker(
                "Background color",
                () => this.backgroundColor,
                (color: string) => this.updateBackgroundColor(color)
            ),
            new ColorPicker(
                "Text Color",
                () => this.textColor,
                (color: string) => this.updateTextColor(color)
            ))
        ];
     
        return ret;
    }

    public updatePadding(newProperty: number) {
        this.padding = newProperty;
    }

    public updateTextColor(newProperty: string) {
        this.textColor = newProperty;
    }

    //TODO: convert HEX to RGB to change alpha-value
    public updateBackgroundColor(newProperty: string) {
        this.backgroundColor = newProperty;
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
        const useStyles = createUseStyles({
            contentBackground: {
                padding: `${this.padding}px`,
                backgroundColor: `${this.backgroundColor}`,
                color: `${this.textColor}`           
            },
          });          

       const { classes } = useStyles();

       return <div id={`_${this.id}`} class={`${classes.contentBackground} ${((this.data.toggle) ? classes.inactive : classes.active )}`}>
                {element}
            </div>
    }

    requestConnectors(): [string, IConnectorPort][] {
        return [[this._connector.id, this._connector]];
    }
}

export const _ContentBubbleModifierSchema = createModelSchema(_ContentBubble, {
    _connector: object(ConnectorSchema)
});

export const plugInExport = exportClass(
    _ContentBubble,
    "Content Bubble",
    "internal.modifier.contentbubble",
    "icon-speaker",
    true
);

export const ContentBubblePlugIn: ModifierPlugIn = {
    name: "Object Background",
    id: "internal.content.contentbubble",
    public: true,
    icon: _ContentBubble.defaultIcon,

    // package: {},
    constructor: _ContentBubble
}