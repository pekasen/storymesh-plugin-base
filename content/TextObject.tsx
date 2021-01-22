import { FunctionComponent, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { reaction, IReactionDisposer } from "mobx";
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
    // public menuTemplate: IMenuTemplate[];
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
        this.userDefinedProperties = {};
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
            userDefinedProperties:  observable,
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
                () => "h1",
                (selection: string) => {
                    console.log(selection);
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
        const Comp: FunctionComponent<INGWebSProps> = ({content}) => {
            const [, setState] = useState({});
            let disposer: IReactionDisposer;
            useEffect(() => {
                disposer = reaction(
                    () => (content?.resource),
                    () => {
                        setState({});
                    }
                )
    
                return () => {
                    disposer();
                }
            });
            return <p>
                {
                    content?.resource
                }
            </p>
        }
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
