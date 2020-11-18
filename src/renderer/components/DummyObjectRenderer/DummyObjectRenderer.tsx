import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { MoveableItem } from '../../store/MoveableItem';
import { RootStore } from '../../store/rootStore';
import { Draggable } from '../Draggable';
import { DragReceiver } from "../DragReceiver";
import { MoveReceiver, MoveSender } from '../Moveable';

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
            const bounds = (e.target as HTMLElement).getBoundingClientRect()
            const coords = {
                x: e.x - bounds.left,
                y: e.y - bounds.top
            };

            console.log(coords);

            if (input) {
                const [loc, type, id] = input.split(".");
            
                console.log("Hello");
                if (id) {
                    switch(loc) {
                        case "internal": {
                            switch(type) {
                                case "content": {
                                    this.makeNewInstance(store, input, loadedObject, coords);
                                    break;
                                }
                                case "container": {
                                    this.makeNewInstance(store, input, loadedObject, coords);
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
        }
        }>
            <div
                id="hello-world"
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.id === "hello-world"){
                        store.uistate.selectedItems.setSelectedItems([]);
                    }
                }
            }>
                {
                    loadedObject.childNetwork?.nodes
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .map((object) => (
                        <MoveReceiver registry={store.uistate.moveableItems} id={object.id} selectedItems={store.uistate.selectedItems}>
                            <DummyObject store={store} object={object}>{object.name}</DummyObject>
                        </MoveReceiver>
                        ))
                    }
            </div>
        </DragReceiver>
    }

    private makeNewInstance(store: RootStore, input: string, loadedObject: IStoryObject, coords: { x: number; y: number; }) {
        const instance = store.storyContentTemplatesRegistry.getNewInstance(input);
        console.log(instance);
        if (instance) {
            loadedObject.childNetwork?.addNode(store.storyContentObjectRegistry, instance);
            store.uistate.selectedItems.setSelectedItems([instance.id]);
            store.uistate.moveableItems.register(new MoveableItem(instance.id, coords.x, coords.y));
        }
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

    constructor(props: DummyObjectProperties) {
        super(props);

        reaction(
            () => ([...props.store.uistate.selectedItems.ids, props.object.name]),
            () => {
                this.setState({});
            }
        );
    }

    render({ store, object, children}: DummyObjectProperties): h.JSX.Element {

        return <Draggable id={object.id}>
            <div class="outer">
            <div
                onClick={(e) => {
                    e.preventDefault();
                    const selectedItems = store.uistate.selectedItems;
                    if (e.shiftKey) {
                        selectedItems.addToSelectedItems(object.id);
                    } else {
                        selectedItems.setSelectedItems([object.id]);
                    }
                }}
                onDblClick={(e) => {
                    e.preventDefault();
                    if(object.role === "internal.container.container") {
                        store.uistate.setLoadedItem(object.id);
                    }
                }}
                class={(store.uistate.selectedItems.isSelected(object.id)) ? "dummy-object active" : "dummy-object inactive"}
            >
                <MoveSender registry={store.uistate.moveableItems} selectedItems={store.uistate.selectedItems} id={object.id}>
                <div class="area-meta">
                    {children}
                    <button class="toggle-content">
                        <span></span>
                        <span></span>
                    </button>
                </div>
                </MoveSender>
                <div class="area-content">
                    <span>Content!</span>
                </div>
            </div>
            </div>
        </Draggable>
    }
}
