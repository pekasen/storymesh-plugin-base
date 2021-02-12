import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { createModelSchema, object } from 'serializr';
import { exportClass } from '../helpers/exportClass';
import { FunctionComponent, h } from "preact";
import { IConnectorPort } from 'storygraph/dist/StoryGraph/IConnectorPort';
import { InputConnectorView } from "./InputConnectorView";
import { IPlugIn, INGWebSProps, IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { IRegistry } from "storygraph/dist/StoryGraph/IRegistry";
import { makeObservable, observable, reaction, action } from 'mobx';
import { MoveableItem } from "../../renderer/store/MoveableItem";
import { ObservableStoryGraph, ObservableStoryGraphSchema } from '../helpers/ObservableStoryGraph';
import { OutputConnectorView } from "./OutputConnectorView";
import { Store } from '../../renderer';
import { DataConnectorInPort, FlowConnectorInPort, FlowConnectorOutPort, StoryGraph } from 'storygraph';
import { AbstractStoryObject, StoryObject } from "../helpers/AbstractStoryObject";
import { UIStore } from "../../renderer/store/UIStore";
import { useContext, useEffect, useState } from "preact/hooks";
import { AbstractStoryModifier } from '../helpers/AbstractModifier';

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
    public icon: string
    public content: undefined;
    public static defaultIcon = "icon-doc"
    
    constructor() {
        super();

        this.name = "Container";
        this.role = "internal.content.container";
        this.isContentNode = false;
        this.childNetwork = new ObservableStoryGraph(this.id);
        this.makeDefaultConnectors();

        this.userDefinedProperties = {};
        this.icon = Container.defaultIcon;

        makeObservable(this, {
            role: false,
            isContentNode: false,
            name: observable,
            userDefinedProperties: observable,
            childNetwork: observable.deep,
            updateName: action
        });
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({id, registry, graph, modifiers}) => {
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
                                userDefinedProperties={node.userDefinedProperties}
                            ></Comp>
                        }
                    }) || null
                }
            </div>

           if (modifiers)  return modifiers.reduce((p, v) => {
                return (v as AbstractStoryModifier).modify(p);
            }, div)
            else return div

        }
        return Comp
    }

    public updateName(name: string): void {
        this.name = name
    }

    public getEditorComponent(): FunctionComponent<INGWebSProps> {
        // TODO: implement mock-drawing of the containers content!
        // TODO: draw using SVGs!
        return () => <div></div>
        // const store = useContext(Store);
        // const [, setState] = useState({});

        // useEffect(
        //     () => {
        //         const disposer = reaction(
        //             () => {
        //                 this.
        //                 childNetwork.
        //                 nodes.
        //                 // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //                 map(e => store.storyContentObjectRegistry.getValue(e)!).
        //                 map(e => store.uistate.moveableItems.getValue(e.id)).
        //                 map(e => [e?.x, e?.y])
        //             },
        //             () => setState({})
        //         )

        //         return () => {
        //             disposer()
        //         }
        //     }
        // );

        // const coords = this.childNetwork.nodes.map(id => {
        //     const mitem = store.uistate.moveableItems.getValue(id);
        //     if (!mitem) throw("Item is not defined!");
        //     return {
        //         x: mitem.x,
        //         y: mitem.y
        //     }
        // });

        // return () => <div class="editor-component">
        //     {
        //         coords.map(item => <div style={`position: absolute; left: ${item?.x}; top: ${item?.y}; background: dark-grey;`}></div>)
        //     }
        // </div>
    }

    public setup(registry: IRegistry, uistate: UIStore): void {
        const start = new InputConnectorView();
        const end = new OutputConnectorView();

        this.childNetwork.addNode(registry, start);
        this.childNetwork.addNode(registry, end);
        uistate.moveableItems.register(new MoveableItem(start.id, 50, 50));
        uistate.moveableItems.register(new MoveableItem(end.id, 50, 350));
        start.setup(this.id, registry);
        end.setup(this.id, registry);
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
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
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
