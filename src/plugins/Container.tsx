import { FunctionComponent, h } from "preact";
import { useContext, useEffect, useState } from "preact/hooks";
import { makeObservable, observable, reaction, IReactionDisposer, action } from 'mobx';
import { StoryGraph } from 'storygraph';
import { IPlugIn, INGWebSProps, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";
import { StoryObject } from "./helpers/AbstractStoryObject";
import { IConnectorPort } from 'storygraph/dist/StoryGraph/IConnectorPort';
import { connectionField, dropDownField, nameField } from './helpers/plugInHelpers';
import { exportClass } from './helpers/exportClass';
import { Store } from '../renderer';
import { ObservableStoryGraph, ObservableStoryGraphSchema } from './helpers/ObservableStoryGraph';
import { createModelSchema, object } from 'serializr';
// import { makeSchemas } from '../renderer/store/schemas/AbstractStoryObjectSchema';
// import { ConnectorDirection, ConnectorPort, ConnectorType } from '../renderer/utils/ConnectorPort';
// const { StoryGraphSchema } = makeSchemas(rootStore.root.storyContentTemplatesRegistry);
/**
 * Our second little dummy PlugIn
 * 
 * 
 */
class _Container extends StoryObject {
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
        this.role = "internal.container.container";
        this.isContentNode = false;
        // this.childNetwork = makeObservable(new StoryGraph(this), {
        //     nodes: observable,
        //     edges: observable,
        //     addNode: action,
        //     connect: action,
        //     disconnect: action,
        //     removeNode: action
        // });
        this.childNetwork = new ObservableStoryGraph(this);
        // this.childNetwork = makeAutoObservable(new StoryGraph(this));
        this.connectors = new Map<string, IConnectorPort>();
        this.makeFlowInAndOut();

        this.userDefinedProperties = {};
        this.icon = _Container.defaultIcon;

        makeObservable(this, {
            role: false,
            isContentNode: false,
            name: observable,
            userDefinedProperties: observable,
            childNetwork: observable.deep,
            connectors: observable.shallow,
            updateName: action,
            // addConnector: action
        });
    }

    public getComponent() {
        const Comp: FunctionComponent<INGWebSProps> = ({id, registry, graph}) => {
            const [, setState] = useState({});
            let disposer: IReactionDisposer;
            useEffect(() => {
                disposer = reaction(
                    () => (graph?.nodes.length),
                    () => {
                        setState({});
                    }
                )
    
                return () => {
                    disposer();
                }
            });
            return <div id={id}>
                {
                    graph?.nodes.map(e => {
                        const Comp = (e as unknown as IPlugIn).getComponent();
        
                        return <Comp
                            registry={registry}
                            id={e.id}
                            renderingProperties={e.renderingProperties}
                            content={e.content}
                            modifiers={e.modifiers}
                            graph={e.childNetwork}
                        ></Comp>
                    }) || null
                }
            </div>
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
                    () => this.
                    childNetwork.
                    nodes.
                    map(e => store.uistate.moveableItems.getValue(e.id)).
                    map(e => [e?.x, e?.y]),
                    () => setState({})
                )

                return () => {
                    disposer()
                }
            }
        );

        const coords = this.childNetwork.nodes.map(node => {
            const mitem = store.uistate.moveableItems.getValue(node.id);
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

    menuTemplate: IMenuTemplate[] = [
        ...nameField(this),
        ...dropDownField(
            this,
            () => ["h1", "h2", "h3", "b", "p"],
            () => "h1",
            (selection: string) => {
                this.userDefinedProperties.class = selection
            }
        ),
        {
            label: "Test",
            type: "text",
            value: () => this.name,
            valueReference: (name: string) => {this.updateName(name)}
        },
        ...connectionField(this),
        // ...addConnectionPortField(this)
    ]
}
createModelSchema(_Container, {
    childNetwork: object(ObservableStoryGraphSchema)
});
// _ContainerSchema.extends = AbstractStoryObjectSchema;
console.log("I'm run!");

export const plugInExport = exportClass(
    _Container,
    "Container",
    "internal.container.container",
    _Container.defaultIcon,
    true
);
