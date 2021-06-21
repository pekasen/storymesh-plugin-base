import { FunctionComponent, h } from "preact";
import { MenuTemplate, TextArea } from "preact-sidebar";
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
export class _CustomCode extends ObservableStoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork?: StoryGraph;
    // public content: IContent;
    public icon: string;

    public static defaultIcon = "icon-picture"

    constructor() {
        super();

        this.name = "Custom Code";
        this.role = "internal.content.customcode";
        this.isContentNode = true;
        this.userDefinedProperties = {};
        this.makeDefaultConnectors();

        this.userDefinedProperties = {
            contents: "",
            compiled: ""
        }
        // this.menuTemplate = connectionField(this);
        this.icon = _CustomCode.defaultIcon;

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            connectors: computed,
            menuTemplate: computed,
            updateContents: action,
            updateName: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new TextArea("Code", () => this.userDefinedProperties.contents, (arg: string) => this.updateContents(arg)),
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
        const compiledStuff = parser.parseFromString(newContent, 'text/html');
        console.log(compiledStuff);
        this.userDefinedProperties.compiled = compiledStuff;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({}) => {

            // const [, setState] = useState({});

            // this._rerender = () => {
            //     setState({});
            // }

            const codeContainer = <div id={this.id} class="custom-code">
                    {this.userDefinedProperties.compiled}
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

createModelSchema(_CustomCode, {
    content: object(ContentSchema)
})

export const plugInExport = exportClass(
    _CustomCode,
    "Custom Code",
    "internal.content.customcode",
    _CustomCode.defaultIcon,
    true
);

export const CustomCodePlugIn: StoryPlugIn = {
    name: "Custom Code",
    id: "internal.content.customcode",
    public: true,
    icon:     _CustomCode.defaultIcon,

    // package: {},
    constructor: _CustomCode
}