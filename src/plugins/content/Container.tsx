import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { createModelSchema, object } from 'serializr';
import { exportClass } from '../helpers/exportClass';
import { FunctionComponent, h } from "preact";
import { IConnectorPort } from 'storygraph/dist/StoryGraph/IConnectorPort';
import { InputConnectorView } from "./InputConnectorView";
import { IPlugIn, INGWebSProps, IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { IRegistry } from "storygraph/dist/StoryGraph/IRegistry";
import { makeObservable, observable, reaction, IReactionDisposer, action } from 'mobx';
import { MoveableItem } from "../../renderer/store/MoveableItem";
import { ObservableStoryGraph, ObservableStoryGraphSchema } from '../helpers/ObservableStoryGraph';
import { OutputConnectorView } from "./OutputConnectorView";
import { Store } from '../../renderer';
import { StoryGraph } from 'storygraph';
import { AbstractStoryObject, StoryObject } from "../helpers/AbstractStoryObject";
import { UIStore } from "../../renderer/store/UIStore";
import { useContext, useEffect, useState } from "preact/hooks";
import { CSSGridContainerModifier } from '../modifiers/GridContainer';
import { CSSModifier, CSSModifierData } from '../helpers/CSSModifier';

/**
 * Our second little dummy PlugIn
 * 
 * 
 */
export class Container extends StoryObject {
    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: any;
    public childNetwork: StoryGraph;
    public connectors: Map<string, IConnectorPort>;
    public icon: string
    public content: undefined;
    public static defaultIcon = "icon-doc"
    
    constructor() {
        super();

        this.name = "Container";
        this.role = "internal.content.container";
        this.isContentNode = false;
        this.childNetwork = new ObservableStoryGraph(this.id);
        this.connectors = new Map<string, IConnectorPort>();
        this.makeFlowInAndOut();

        this.userDefinedProperties = {};
        this.icon = Container.defaultIcon;

        makeObservable(this, {
            role: false,
            isContentNode: false,
            name: observable,
            userDefinedProperties: observable,
            childNetwork: observable.deep,
            connectors: observable.shallow,
            updateName: action
        });
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({id, registry, graph, modifiers}) => {
            // const [, setState] = useState({});
            // let disposer: IReactionDisposer;
            
            // useEffect(() => {
            //     disposer = reaction(
            //         () => (graph?.nodes.length),
            //         () => {
            //             setState({});
            //         }
            //     )
    
            //     return () => {
            //         disposer();
            //     }
            // });

            // const cssInline = modifiers?.
            //     filter(modifier => modifier.type === "css-inline").
            //     map(modifier => {
            //         const m = modifier as CSSGridContainerModifier;
            //         const data = m.data;
            //         return Object.keys(data).map(key => `${key}: ${data[key]};`).join(" ");
            //     }).
            //     join(" ");
            // const cssClasses = modifiers?.
            //     filter(modifier => modifier.type === "css-class").
            //     map(modifier => {
            //         const m = modifier as CSSGridContainerModifier;
            //         const data = m.data;
            //         return Object.keys(data).map(key => data[key] as string)
            //     }).
            //     join(" ");

            const div = <div id={id}>
                {
                    graph?.nodes.map(e => {
                        const node = (registry.getValue(e) as unknown as IPlugIn & AbstractStoryObject);

                        if (node.getComponent) {
                            const Comp = node.getComponent();
                            return <Comp
                                registry={registry}
                                id={node.id}
                                renderingProperties={node.renderingProperties}
                                content={node.content}
                                modifiers={node.modifiers}
                                graph={node.childNetwork}
                            ></Comp>
                        }
                    }) || null
                }
            </div>
            // console.log("found following css statements", cssInline, cssClasses);

            // if (cssInline) div.props.style = cssInline;
            // if (cssClasses) div.props.style = cssClasses;
            return this.modifiers.reduce((p, v) => {
                return v.modify(p);
            }, div)
            // return div;
        }
        return Comp
    }

    public updateName(name: string): void {
        this.name = name
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        // TODO: implement mock-drawing of the containers content!
        // TODO: draw using SVGs!
        const store = useContext(Store);
        const [, setState] = useState({});

        useEffect(
            () => {
                const disposer = reaction(
                    () => {
                        this.
                        childNetwork.
                        nodes.
                        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                        map(e => store.storyContentObjectRegistry.getValue(e)!).
                        map(e => store.uistate.moveableItems.getValue(e.id)).
                        map(e => [e?.x, e?.y])
                    },
                    () => setState({})
                )

                return () => {
                    disposer()
                }
            }
        );

        const coords = this.childNetwork.nodes.map(id => {
            // const node = store.storyContentObjectRegistry.getValue(id);
            const mitem = store.uistate.moveableItems.getValue(id);
            if (!mitem) throw("Item is not defined!");
            return {
                x: mitem.x,
                y: mitem.y
            }
        });

        return () => <div class="editor-component">
            {
                coords.map(item => <div style={`position: absolute; left: ${item?.x}; top: ${item?.y}; background: dark-grey;`}></div>)
            }
        </div>
    }

    public setup(registry: IRegistry, uistate: UIStore): void {
        const start = new InputConnectorView();
        const end = new OutputConnectorView();
        if (start && end) {
            this.childNetwork.addNode(registry, start);
            uistate.moveableItems.register(new MoveableItem(start.id, 50, 50));
            this.childNetwork.addNode(registry, end);
            uistate.moveableItems.register(new MoveableItem(end.id, 50, 350));

            start.setup(registry);
            end.setup(registry);
        }
    }

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
            ...nameField(this),
            ...dropDownField(
                this,
                () => ["h1", "h2", "h3", "b", "p"],
                () => "h1",
                (selection: string) => {
                    this.userDefinedProperties.class = selection
                }
            ),
            ...connectionField(this),
            // {
            //     type: "divider"
            // }
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;

        // return [
        //     ...super.menuTemplate,
        //     ...nameField(this),
        //     ...dropDownField(
        //         this,
        //         () => ["h1", "h2", "h3", "b", "p"],
        //         () => "h1",
        //         (selection: string) => {
        //             this.userDefinedProperties.class = selection
        //         }
        //     ),
        //     {
        //         label: "Test",
        //         type: "text",
        //         value: () => this.name,
        //         valueReference: (name: string) => {this.updateName(name)}
        //     },
        //     ...connectionField(this),
        //     // ...addConnectionPortField(this)
        // ]
    }
}
createModelSchema(Container, {
    childNetwork: object(ObservableStoryGraphSchema)
});

export const plugInExport = exportClass(
    Container,
    "Container",
    "internal.content.container",
    Container.defaultIcon,
    true
);
