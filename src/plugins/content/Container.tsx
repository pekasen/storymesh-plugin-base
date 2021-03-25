import { connectionField, dropDownField, nameField } from '../helpers/plugInHelpers';
import { createModelSchema, object } from 'serializr';
import { exportClass } from '../helpers/exportClass';
import { FunctionComponent, h } from "preact";
import { InputConnectorView } from "./InputConnectorView";
import { IRegistry } from "storygraph/dist/StoryGraph/IRegistry";
import { makeObservable, observable, action, computed } from 'mobx';
import { MoveableItem } from "../../renderer/store/MoveableItem";
import { ObservableStoryGraph, ObservableStoryGraphSchema } from '../helpers/ObservableStoryGraph';
import { OutputConnectorView } from "./OutputConnectorView";
import { IStoryObject, StoryGraph } from 'storygraph';
import { StoryObject } from "../helpers/AbstractStoryObject";
import { UIStore } from "../../renderer/store/UIStore";
import { AbstractStoryModifier } from '../helpers/AbstractModifier';
import { MenuTemplate, Text, DropDown, ColorPicker } from 'preact-sidebar';
import { INGWebSProps, IPlugIn } from '../../renderer/utils/PlugInClassRegistry';
import { useEffect, useState } from 'preact/hooks';
import Logger from 'js-logger';

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
    public startNode?: InputConnectorView;
    public endNode?: OutputConnectorView;
    public static defaultIcon = "icon-doc"

    constructor() {
        super();

        this.name = "Container";
        this.role = "internal.content.container";
        this.isContentNode = false;
        this.childNetwork = new ObservableStoryGraph(this.id);
        this.childNetwork.notificationCenter.subscribe(this.id + "/rerender", () => {
            if (this._rerender) this._rerender();
        });
        this.makeDefaultConnectors();


        this.userDefinedProperties = {
            padding: "0 0 0 0",
            maxWidth: "auto",
            placeItems: "center",
            backgroundColor: "#ffffff",
            textColor: "#121212"
        };
        this.icon = Container.defaultIcon;

        makeObservable(this, {
            role: false,
            isContentNode: false,
            name: observable,
            userDefinedProperties: observable,
            childNetwork: observable.deep,
            connectors: computed,
            menuTemplate: computed,
            updateName: action,
            updatePadding: action,
            updateMaxWidth: action,
            updatePlaceItems: action,
            updateBackgroundColor: action,
            updateTextColor: action
        });
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({ id, registry, graph, modifiers }) => {
            // const startNode = graph?
            // TODO: class name?

            const [, setState] = useState({});

            useEffect(() => {
                this._rerender = () => {
                    Logger.info(`${this.id} rerendering`);
                    setState({});
                };

                return () => {
                    this._rerender = undefined;
                };
            });

            let path: IStoryObject[] | undefined;
            let div: h.JSX.Element;
            if (this.startNode) {
                path = graph?.traverse(registry, this.startNode.id, Array.from(this.startNode.connectors)[0][1].id)
                if (path !== undefined) {
                    div = <div style={`padding:${this.userDefinedProperties.padding};
                                       max-width:${this.userDefinedProperties.maxWidth};
                                       place-items:${this.userDefinedProperties.placeItems};
                                       background-color:${this.userDefinedProperties.backgroundColor};
                                       color:${this.userDefinedProperties.textColor}`} id={id} class={"ngwebs-story-container"}>
                        {
                            path.map(node => {
                                // const node = (registry.getValue(e) as unknown as IPlugIn & StoryObject);
                                const _node = node as StoryObject & IPlugIn;
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
                            }) || null}
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

    public updatePadding(padding: string): void {
        this.userDefinedProperties.padding = padding
    }

    public updateMaxWidth(maxWidth: string): void {
        this.userDefinedProperties.maxWidth = maxWidth
    }

    public updatePlaceItems(placeItems: string): void {
        this.userDefinedProperties.placeItems = placeItems
    }

    public updateBackgroundColor(backgroundColor: string): void {
        this.userDefinedProperties.backgroundColor = backgroundColor
    }

    public updateTextColor(textColor: string): void {
        this.userDefinedProperties.textColor = textColor
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
            new Text("Padding", { defaultValue: "0 0 0 0" }, () => this.userDefinedProperties.padding, (arg: string) => this.updatePadding(arg)),
            new Text("Maximum width", { defaultValue: "auto" }, () => this.userDefinedProperties.maxWidth, (arg: string) => this.updateMaxWidth(arg)),
            new DropDown(
                "Place Items",
                {
                    options: ["start", "center", "end"]
                },
                () => this.userDefinedProperties.placeItems,
                (item) => this.updatePlaceItems(item)
            ),
            new ColorPicker(
                "Background Color",
                () => this.userDefinedProperties.backgroundColor,
                (color) => this.updateBackgroundColor(color)
            ),
            new ColorPicker(
                "Text Color",
                () => this.userDefinedProperties.textColor,
                (color) => this.updateTextColor(color)
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
