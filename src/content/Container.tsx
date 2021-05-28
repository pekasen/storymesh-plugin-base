import {  MenuTemplate } from "preact-sidebar";
import { PlugIn, VReg } from "storymesh-plugin-support";
import { makeObservable, observable, action, computed } from 'mobx';
import { createModelSchema, object } from 'serializr';
import { FunctionComponent, h } from "preact";
import { IStoryObject, StoryGraph } from 'storygraph';

import { IRegistry } from "storygraph/dist/StoryGraph/IRegistry";
import { InputConnectorView } from "./InputConnectorView";
import { OutputConnectorView } from "./OutputConnectorView";

import { MoveableItem } from "../../renderer/store/MoveableItem";
import { UIStore } from "../../renderer/store/UIStore";

import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { ObservableStoryGraph, ObservableStoryGraphSchema } from '../helpers/ObservableStoryGraph';
import { AbstractStoryObject, StoryObject } from "../helpers/AbstractStoryObject";
import { AbstractStoryModifier } from '../helpers/AbstractModifier';
import { INGWebSProps } from "../helpers/INGWebSProps";
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
    public startNode?:InputConnectorView;
    public endNode?: OutputConnectorView;
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
            connectors: computed,
            menuTemplate: computed,
            updateName: action
        });
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({id, registry, graph, modifiers}) => {
            // const startNode = graph?
            // TODO: class name?
            let path: IStoryObject[] | undefined;
            let div: h.JSX.Element;
            if ( this.startNode) {
                path = graph?.traverse(registry, this.startNode.id, Array.from(this.startNode.connectors)[0][1].id)
                if (path !== undefined) {
                    div = <div id={id} class={"ngwebs-story-container"}>
                    {
                        path.map(node => {
                            // const node = (registry.getValue(e) as unknown as IPlugIn & AbstractStoryObject);
                            const _node = node as AbstractStoryObject & PlugIn;
                            if (_node.getComponent) {
                                const Comp = _node.getComponent();
                                return <Comp
                                    registry={registry}
                                    id={_node.id}
                                    renderingProperties={_node.renderingProperties}
                                    content={_node.content}
                                    modifiers={_node.modifiers}
                                    graph={_node.childNetwork}
                                    userDefinedProperties={_node.userDefinedProperties}
                                ></Comp>
                            }
                        }) || null }
                    </div>

                    if (modifiers) return modifiers.reduce((p, v) => {
                        return (v as AbstractStoryModifier).modify(p);
                    }, div)
                }
            } 
            return <div></div>
            // div = <div id={id} class={"ngwebs-story-container"}>
            //     {
            //         graph?.nodes.map(e => {
            //             const node = (registry.getValue(e) as unknown as IPlugIn & AbstractStoryObject);

            //             if (node.getComponent) {
            //                 const Comp = node.getComponent();
            //                 return <Comp
            //                     registry={registry}
            //                     id={node.id}
            //                     renderingProperties={node.renderingProperties}
            //                     content={node.content}
            //                     modifiers={node.modifiers}
            //                     graph={node.childNetwork}
            //                     userDefinedProperties={node.userDefinedProperties}
            //                 ></Comp>
            //             }
            //         }) || null
            //     }
            // </div>

           

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

    public setup(registry: VReg, uistate: UIStore): void {
        this.startNode = new InputConnectorView();
        this.endNode = new OutputConnectorView();

        this.childNetwork.addNode(registry, this.startNode);
        this.childNetwork.addNode(registry, this.endNode);
        uistate.moveableItems.register(new MoveableItem(this.startNode.id, 50, 50));
        uistate.moveableItems.register(new MoveableItem(this.endNode.id, 50, 350));
        this.startNode.setup(this.id, registry);
        this.endNode.setup(this.id, registry);
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
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
