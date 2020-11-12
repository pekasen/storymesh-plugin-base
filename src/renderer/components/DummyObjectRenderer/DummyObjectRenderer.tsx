import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { RootStore } from '../../store/rootStore';
import { DragReceiver } from "../DragReceiver";

export interface IDummyObjectRendererProperties {
    loadedObject: IStoryObject
    store: RootStore
}

export class DummyObjectRenderer extends Component<IDummyObjectRendererProperties> {
    
    disposer: IReactionDisposer

    constructor(props: IDummyObjectRendererProperties) {
        super(props);

        this.disposer = reaction(
            () => {
                const id = props.store.uistate.loadedItem;
                const network = props.store.storyContentObjectRegistry.getValue(id)?.childNetwork;
                const names = network?.nodes.map(_ => _.name)
                return {
                    selectedItem: id,
                    network: network?.nodes.length,
                    names: names
                }
            },
            () => {
                console.log("I changed!");
                this.setState({});
            }
        );
    }
    
    render({loadedObject, store}: IDummyObjectRendererProperties): h.JSX.Element {
        return <DragReceiver 
        onDrop={(e) => {
            const input = e.dataTransfer?.getData('text');

            if (input) {
                const [loc, type, id] = input.split(".");
            
                console.log("Hello");
                if (id) {
                    switch(loc) {
                        case "internal": {
                            switch(type) {
                                case "content": {
                                    const instance = store.storyContentTemplatesRegistry.getNewInstance(input);
                                    console.log(instance);
                                    if (instance) {
                                        loadedObject.childNetwork?.addNode(store.storyContentObjectRegistry, instance);
                                        store.uistate.setselectedItem(instance.id);
                                    }
                                    break;
                                }
                                case "container": {
                                    const instance = store.storyContentTemplatesRegistry.getNewInstance(input);
                                    console.log(instance);
                                    if (instance) {
                                        loadedObject.childNetwork?.addNode(store.storyContentObjectRegistry, instance);
                                        store.uistate.setselectedItem(instance.id)
                                    }
                                    break;
                                }
                                default: break;
                            }
                            break;
                        }
                        case "external": {
                            break;
                        }
                        default: break;
                    }
                }
            }
            console.log(store.storyContentObjectRegistry)
        }}>
            <div id="hello-world" style="width: 100%; height: 100%;" onDblClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.id === "hello-world"){
                    store.uistate.setselectedItem("");
                }
            }}>
                {
                    loadedObject.childNetwork?.nodes
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .map((object) => (
                        <DummyObject store={store} object={object}>{object.name}</DummyObject>
                        ))
                    }
            </div>
        </DragReceiver>
    }

    componentWillUnmount(): void {
        this.disposer();
    }
}

interface DummyObjectProperties {
    store: RootStore
    object: IStoryObject
    children: string
}

export class DummyObject extends Component<DummyObjectProperties> {

    public active: boolean

    constructor(props: DummyObjectProperties) {
        super(props);

        this.active = props.store.uistate.selectedItem === props.object.id;

        reaction(
            () => ({
                selectedItem: props.store.uistate.selectedItem,
                name: props.object.name
            }),
            ({ selectedItem, name }) => {
                if (props.object.id === selectedItem) {
                    this.active = true;
                } else this.active = false;
                this.setState({});
            }
        );
    }

    render({ store, object, children}: DummyObjectProperties): h.JSX.Element {
        return <div
            onClick={(e) => {
                e.preventDefault();
                store.uistate.setselectedItem(object.id)
            }}
            onDblClick={(e) => {
                e.preventDefault();
                if(object.role === "container") {
                    store.uistate.setLoadedItem(object.id);
                }
            }}
            class={(this.active) ? "dummy-object active" : "dummy-object inactive"}
        >{children}</div>
    }
}