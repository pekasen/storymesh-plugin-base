import { FunctionComponent, h } from "preact";
import { MenuTemplate, TextArea, Button } from "preact-sidebar";
import { createModelSchema, object } from 'serializr';
import { action, computed, makeObservable, observable } from 'mobx';
import { StoryGraph, StoryPlugIn } from 'storygraph';
import { connectionField, nameField, exportClass, INGWebSProps, ContentSchema } from 'storygraph';
import { ObservableStoryObject } from "../helpers/ObservableStoryObject";


/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
export class _SvgObject extends ObservableStoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork?: StoryGraph;
    // public content: IContent;
    public icon: string;
    public compiled: any;

    public static defaultIcon = "icon-picture"

    constructor() {
        super();

        this.name = "SVG";
        this.role = "internal.content.svgobject";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeDefaultConnectors();

        this.userDefinedProperties = {
            contents: "",
        }

        this.compiled = undefined;
        // this.menuTemplate = connectionField(this);
        this.icon = _SvgObject.defaultIcon;

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            compiled: observable,
            connectors: computed,
            menuTemplate: computed,
            updateContents: action,
            updateName: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new TextArea("XML", () => this.userDefinedProperties.contents, (arg: string) => this.updateContents(arg)),
            new Button("Test", () => this.testStuff()),
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }

    public updateName(name: string) {
        this.name = name;
    }

    public updateContents(newContent: string) {
        const parser = new DOMParser();
        const compiledStuff = parser.parseFromString(newContent, 'image/svg+xml');
        console.log(compiledStuff);
        this.compiled = compiledStuff;
    }

    public testStuff() {
        console.log("Wohoo it'S in there!" + this.compiled);
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({}) => {

            // const [, setState] = useState({});

            // this._rerender = () => {
            //     setState({});
            // }

            const codeContainer = <div id={this.id} class="svg">
                        {this.compiled}   
                </div>;
                return this.modifiers.reduce((p, v) => (
                        v.modify(p)
                    ), codeContainer)
        }
        return Comp
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component"></div>
    }
}

createModelSchema(_SvgObject, {
    content: object(ContentSchema)
})

export const plugInExport = exportClass(
    _SvgObject,
    "SVG",
    "internal.content.svgobject",
    _SvgObject.defaultIcon,
    true
);

export const SvgPlugIn: StoryPlugIn = {
    name: "SVG",
    id: "internal.content.svgobject",
    public: true,
    icon:     _SvgObject.defaultIcon,

    // package: {},
    constructor: _SvgObject
}