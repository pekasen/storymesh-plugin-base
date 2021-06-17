import { FunctionComponent, h } from "preact";
import { MenuTemplate, TextArea, Text } from "preact-sidebar";
import { createModelSchema, object } from 'serializr';
import { useState } from "preact/hooks";
import { action, computed, makeObservable, observable } from 'mobx';
import { StoryGraph } from 'storygraph';
// import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, nameField, exportClass, StoryObject, INGWebSProps, ContentSchema } from 'storygraph';
import { StoryPlugIn } from "../../../storygraph/dist/StoryGraph/registry/PlugIn";

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
// @observable
export class _CustomCode extends StoryObject {
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
        }
        // this.menuTemplate = connectionField(this);
        this.icon = _CustomCode.defaultIcon;

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            connectors: computed,
            menuTemplate: computed,
            updateContents: action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            //TODO: Use Textarea
            new Text("Code", {defaultValue: ""}, () => this.userDefinedProperties.contents, (arg: string) => this.updateContents(arg)),
            ...connectionField(this),
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }

    public updateContents(newContent: string) {
        this.userDefinedProperties.contents = newContent;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({ content }) => {

            const [, setState] = useState({});

            this._rerender = () => {
                setState({});
            }

            const codeContainer = <div id={this.id} class="custom-code">
                    {this.userDefinedProperties.contents}
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
    "Image",
    "internal.content.image",
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