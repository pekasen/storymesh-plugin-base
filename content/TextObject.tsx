import { FunctionalComponent, FunctionComponent, h } from "preact";
import { runInAction } from "mobx";
import { IMenuTemplate, INGWebSProps } from "../../renderer/utils/PlugInClassRegistry";
import { action, makeObservable, observable } from 'mobx';
import { IConnectorPort, StoryGraph } from 'storygraph';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
class _TextObject extends StoryObject {
    
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public content: IContent;
    public childNetwork?: StoryGraph | undefined;
    public connectors: Map<string, IConnectorPort>;
    public icon: string;
    public static defaultIcon = "icon-newspaper";
    
    constructor() {
        super();
        this.isContentNode = true;
        this.role = "internal.content.text"
        this.name = "Text" // [this.role, this.id].join("_");
        this.renderingProperties = {
            width: 100,
            order: 1,
            collapsable: false
        };
        this.connectors = new Map<string, IConnectorPort>();
        [
            {
                name: "enterView",
                type: "reaction",
                direction: "out"
            }
        ].forEach(e => this.connectors.set(e.name, e as IConnectorPort));
        this.makeFlowInAndOut();
        this.content = {
            resource: "Type here...",
            altText: "empty",
            contentType: "text"
        };
        this.userDefinedProperties = {
            tag: "p"
        };
        // this.menuTemplate = [
        //     ...nameField(this),
        //     {
        //         label: "Content",
        //         type: "textarea",
        //         value: () => this.content.resource,
        //         valueReference: (text: string) => {this.updateText(text)}
        //     },
        //     ...dropDownField(
        //         this,
        //         () => ["h1", "h2", "h3", "b", "p"],
        //         () => "h1",
        //         (selection: string) => {
        //             console.log(selection);
        //         }
        //     ),
        //     ...connectionField(this)
        // ];
        this.icon = _TextObject.defaultIcon;

        makeObservable(this, {
            id: false,
            name:                   observable,
            userDefinedProperties:  observable.deep,
            content:                observable,
            connectors:             observable.shallow,
            updateName:             action,
            updateText:             action
        });
    }

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
            ...nameField(this),
            {
                label: "Content",
                type: "textarea",
                value: () => this.content.resource,
                valueReference: (text: string) => {this.updateText(text)}
            },
            ...dropDownField(
                this,
                () => ["h1", "h2", "h3", "b", "p"],
                () => this.userDefinedProperties.tag,
                (selection: string) => {
                    console.log(selection);
                    runInAction(() => this.userDefinedProperties.tag = selection);
                }
            ),
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

    public updateText(text: string) {
        if (this.content) this.content.resource = text;
    }

    public getComponent() {
        const Comp: FunctionComponent<INGWebSProps> = (args => {
            console.log("rendering", args);

            const elemMap = new Map<string, FunctionalComponent>([
                ["h1", ({children, ...props}) => (<h1 {...props}>{children}</h1>)],
                ["h2", ({children, ...props}) => (<h2 {...props}>{children}</h2>)],
                ["h3", ({children, ...props}) => (<h3 {...props}>{children}</h3>)],
                ["b", ({children, ...props}) => (<b {...props}>{children}</b>)],
                ["p", ({children, ...props}) => (<p {...props}>{children}</p>)],
            ]);
            let Elem: FunctionalComponent | undefined;

            if (args.userDefinedProperties && args.userDefinedProperties.tag) {
                Elem = elemMap.get(args.userDefinedProperties.tag);
            }
            if (!Elem) {
                Elem = ({children, ...props}) => (<p {...props}>{children}</p>)
            }
            const p = <Elem>{args.content?.resource}</Elem>;
            
            const a = this.modifiers.reduce((p,v) => {
                const s = (v.modify(p));
                console.log("modifying", s);
                return s;
            }, p);
            console.log("modified", a);
            return a;
        });
        return Comp
    }
}

createModelSchema(_TextObject,{
    
})

export const plugInExport = exportClass(
    _TextObject,
    "Text",
    "internal.content.text",
    _TextObject.defaultIcon,
    true
);
