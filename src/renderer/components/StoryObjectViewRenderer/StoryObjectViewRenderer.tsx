import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { MoveableItem } from '../../store/MoveableItem';
import { RootStore } from '../../store/rootStore';
import { DragReceiver } from "../DragReceiver";
import { MoveReceiver } from '../Moveable';
import { StoryObjectView } from '../StoryObjectView/StoryObjectView';

export interface IStoryObjectViewRendererProperties {
    loadedObject: IStoryObject
    store: RootStore
}

export class StoryObjectViewRenderer extends Component<IStoryObjectViewRendererProperties> {
    
    disposeReaction: IReactionDisposer

    constructor(props: IStoryObjectViewRendererProperties) {
        super(props);

        this.disposeReaction = reaction(
            () => {
            return {
                id: props.store.uistate.loadedItem,
                names: props.loadedObject.childNetwork?.nodes.map(e => e.name),
                edges: props.loadedObject.childNetwork?.edges.map(e => e.id)
            // const 
                // const network = ;
                // if ( names ) return [id, names.length, ...names] 
                // else return id
            }},
            (i) => {
                console.log("I changed!", i);
                this.setState({});
            }
        );
    }
    
    render({loadedObject, store}: IStoryObjectViewRendererProperties): h.JSX.Element {
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
                            <StoryObjectView store={store} object={object}>{object.name}</StoryObjectView>
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
        this.disposeReaction();
    }
}
