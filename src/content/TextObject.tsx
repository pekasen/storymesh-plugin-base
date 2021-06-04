import { FunctionComponent, h } from "preact";
import { action, makeObservable, observable } from 'mobx';
import { INGWebSProps, StoryGraph, connectionField, nameField, StoryObject, exportClass } from 'storygraph';
import { createModelSchema, list, ModelSchema, object, optional, primitive } from 'serializr';
import Delta from "quill-delta";
import { MenuTemplate, RichText } from "preact-sidebar";
import { convertDeltaToHtml } from 'node-quill-converter';
import Op from "quill-delta/dist/Op";

interface ITextObjectContent {
    resource: Delta
    altText: string
    contentType: "text"
}

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
class _TextObject extends StoryObject {
    
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: {
        tag: string
    };
    public content: ITextObjectContent;
    public childNetwork?: StoryGraph | undefined;
    public icon: string;
    public static defaultIcon = "icon-newspaper";
    
    constructor() {
        super();
        this.isContentNode = true;
        this.role = "internal.content.text";
        this.name = "Text";
        this.renderingProperties = {
            width: 100,
            order: 1,
            collapsable: false
        };
        this.makeDefaultConnectors();
        this.content = {
            resource: new Delta(),
            altText: "empty",
            contentType: "text"
        };
        this.userDefinedProperties = {
            tag: "p"
        };
        this.icon = _TextObject.defaultIcon;

        makeObservable(this, {
            id: false,
            name:                   observable,
            userDefinedProperties:  observable.deep,
            content:                observable,
            updateName:             action,
            updateText:             action
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new RichText("Content", () => this.content.resource, (arg: Delta) => this.updateText(arg)),
            // {
            //     label: "Content",
            //     type: "textarea",
            //     value: () => this.content.resource,
            //     valueReference: (text: string) => {this.updateText(text)}
            // },
            //...dropDownField(
            //    this,
            //    () => ["h1", "h2", "h3", "b", "p"],
            //    () => this.userDefinedProperties.tag,
            //    (selection: string) => {
            //        Logger.info(selection);
            //        runInAction(() => this.userDefinedProperties.tag = selection);
            //    }
            //),
            ...connectionField(this)
        ];
        if (super.menuTemplate) ret.push(...super.menuTemplate);
        return ret;
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        return () => <div class="editor-component">
            <p>{this.content.resource}</p>
        </div>
    }

    public updateName(newValue: string): void {
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        this.name = newValue;
    }

    public updateText(text: Delta) {
        if (this.content) this.content.resource = text;
    }

    public getComponent() {    
        const Comp: FunctionComponent<INGWebSProps> = (args => {
            let p: h.JSX.Element;
            // TODO: is that supposed to be like that?
            p = <span dangerouslySetInnerHTML={{ __html: convertDeltaToHtml(new Delta(args.content?.resource as unknown as Op[])) as string}} />
            return this.modifiers.reduce((p,v) => {
                return (v.modify(p));
            }, p);
        });

        return Comp
    }
}

const AttributeSchema: ModelSchema<any> = {
    factory: () => ({}),
    props: {
        "*": true
    }
}

const OpSchema: ModelSchema<Op> = {
    factory: () => ({}),
    props: {
        insert: optional(primitive()),
        delete: optional(primitive()),
        retain: optional(primitive()),
        attributes: optional(object(AttributeSchema))
    }
};

createModelSchema(Delta, {
    ops: list(object(OpSchema))
});

const TextContentSchema: ModelSchema<ITextObjectContent> = {
    factory: () => ({
        resource: new Delta(),
        altText: "",
        contentType: "text"
    }),
    props: {
        resource: object(Delta),
        altText: primitive(),
        contentType: primitive()
    }
}

createModelSchema(_TextObject,{
    content: object(TextContentSchema)
});

export const plugInExport = exportClass(
    _TextObject,
    "Text",
    "internal.content.text",
    _TextObject.defaultIcon,
    true
);
