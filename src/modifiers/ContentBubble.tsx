import Logger from "js-logger";
import { h } from "preact";
import { runInAction } from "mobx";
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema, object } from "serializr";
import { exportClass, HTMLModifier, IConnectorPort, ReactionConnectorInPort, ConnectorSchema, dropDownField, nameField, ModifierPlugIn } from "storygraph";
import { HSlider, DropDown, MenuTemplate, ColorPicker, Divider } from "preact-sidebar";
import { createUseStyles } from 'preact-jss-hook';
import { GridContainerInlineStatementsSchema } from "./GridContainer";

export class _ContentBubble extends HTMLModifier {

    public name: string = "";
    public role: string = "internal.modifier.objectbackground";
    public data: any = {
        toggle: true
    }
    public static defaultIcon = "icon-eye";
    public padding: number;
    public textColor: string;
    public backgroundColor: any;
    public backgroundOpacity: number;
    public borderRadius: number;
    public placeItems: string;

    constructor() {
        super();

        this.padding = 0;
        this.textColor = "#fff";
        this.backgroundColor = "#252525";
        this.backgroundOpacity = 1;
        this.borderRadius = 0;
        this.placeItems = 'center';

        makeObservable(this, {
            padding: observable,
            textColor: observable,
            backgroundColor: observable,
            backgroundOpacity: observable,
            borderRadius: observable,
            placeItems: observable,
            updatePadding: action,
            updateTextColor: action,
            updateBackgroundColor: action,
            updateBackgroundOpacity: action,
            updateBorderRadius: action,
            updatePlaceItems: action
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
            new HSlider(
                "Border Radius",
                {
                    min: 0,
                    max: 100,
                    formatter: (val: number) => `${val}%`
                },
                () => this.borderRadius,
                (radius: number) => this.updateBorderRadius(radius)
            ),
            new ColorPicker(
                "Background color",
                () => this.backgroundColor,
                (color: string) => this.updateBackgroundColor(color)
            ),
            new HSlider(
                "Background Opacity",
                {
                    min: 0,
                    max: 1,
                    formatter: (val: number) => `${val}`
                },
                () => this.backgroundOpacity,
                (opacity: number) => this.updateBackgroundOpacity(opacity)
            ),
            new ColorPicker(
                "Text Color",
                () => this.textColor,
                (color: string) => this.updateTextColor(color)
            ),
            new DropDown(
                "Place Items",
                {
                    options: ["start", "center", "end"]
                },
                () => this.placeItems,
                (item) => this.updatePlaceItems(item)
            ),
        ];
     
        return ret;
    }

    public updatePadding(newProperty: number) {
        this.padding = newProperty;
    }

    public updateBorderRadius(newProperty: number) {
        this.borderRadius = newProperty;
    }

    public updateTextColor(newProperty: string) {
        this.textColor = newProperty;
    }

    public convertToRGB (c: string){
            let result = /^#?([a-fd]{2})([a-fd]{2})([a-fd]{2})$/i.exec(c);
            if(result){
                let r = parseInt(result[1], 16);
                let g = parseInt(result[2], 16);
                let b = parseInt(result[3], 16);
                let returnValue = `${r}, ${g}, ${b}`;

                return returnValue;
            }
    }    

    //TODO: convert HEX to RGB to change alpha-value
    public updateBackgroundColor(newProperty: string) {
        this.backgroundColor = this.convertToRGB(newProperty);
    }

    public updateBackgroundOpacity(newProperty: number) {
        this.backgroundOpacity = (newProperty);
    }

    public updatePlaceItems(placeItems: string): void {
        this.placeItems = placeItems
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
                borderRadius: `${this.borderRadius}%`,
                backgroundColor: `rgba(${this.backgroundColor}, ${this.backgroundOpacity.toString()})`,
                color: `${this.textColor}`,
                display: "grid",
                placeItems: `${this.placeItems}`          
            },
          });          

       const { classes } = useStyles();

       return <div id={`_${this.id}`} class={`${classes.contentBackground}`}>
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