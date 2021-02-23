import { IReactionDisposer, reaction } from 'mobx';
import { Component, FunctionalComponent, h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { Store } from '../..';
import { Container } from '../../../plugins/content/Container';
import { AbstractStoryObject } from '../../../plugins/helpers/AbstractStoryObject';
import { MoveableItem } from '../../store/MoveableItem';
import { RootStore } from '../../store/rootStore';
import { DragReceiver } from "../DragReceiver";
import { EdgeRenderer } from '../EdgeRenderer/EdgeRenderer';
import { MoveReceiver } from '../Moveable';
import { StoryObjectView } from '../StoryObjectView/StoryObjectView';

export interface IStoryObjectViewRendererProperties {
    loadedObject: AbstractStoryObject
    store: RootStore
}

// export class StoryObjectViewRenderer extends Component<IStoryObjectViewRendererProperties> {
    
//     disposeReaction: IReactionDisposer

//     constructor(props: IStoryObjectViewRendererProperties) {
//         super(props);

//         const store = useContext(Store);

//         this.disposeReaction = reaction(
//             () => {
//                 const id = store.uistate.loadedItem;
//                 const network = store.storyContentObjectRegistry.getValue(id)?.childNetwork;
//                 if (!network) throw("network ist not defined!");
//             return {
//                 id: id,
//                 names: network.nodes.map(id => store.storyContentObjectRegistry.getValue(id)?.name),
//                 edges: network.edges.map(e => e.id)
//             }},
//             (i) => {
//                 console.log("I changed!", i);
//                 this.setState({});
//             }
//         );
//     }
    
//     render(): h.JSX.Element {
//         const store = useContext(Store);
//         const loadedObjectId = store.uistate.loadedItem;
//         const loadedObject = store.storyContentObjectRegistry.getValue(loadedObjectId);

//         if (!loadedObject) throw("loadedObject is not defined");

//         return <DragReceiver 
//         onDrop={(e) => {
//             const input = e.dataTransfer?.getData('text');
//             const bounds = (e.target as HTMLElement).getBoundingClientRect()
//             const coords = {
//                 x: e.x - bounds.left,
//                 y: e.y - bounds.top
//             };

//             console.log(coords);

//             if (input) {
//                 const [loc, type, id] = input.split(".");

//                 if (id) {
//                     switch(loc) {
//                         case "internal": {
//                             switch(type) {
//                                 case "content": {
//                                     this.makeNewInstance(store, input, loadedObject, coords);
//                                     break;
//                                 }
//                                 case "container": {
//                                     this.makeNewInstance(store, input, loadedObject, coords);
//                                     break;
//                                 }
//                                 default: break;
//                             }
//                             break;
//                         }
//                         case "external": {
//                             break;
//                         }
//                         default: break;
//                     }
//                 }
//             }
//             console.log(store.storyContentObjectRegistry)
//         }
//         }>
//             <div
//                 id="node-editor"
//                 onClick={(e) => {
//                     const target = e.target as HTMLElement;
//                     if (target.id === "node-editor"){
//                         store.uistate.selectedItems.clearSelectedItems();
//                     }
//                 }
//             }>
//                 <EdgeRenderer></EdgeRenderer>
//                 {
//                     loadedObject.childNetwork?.nodes
//                     // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
//                     .map(id => store.storyContentObjectRegistry.getValue(id))
//                     .map((object) => {
//                         if (object) return <MoveReceiver registry={store.uistate.moveableItems} id={object.id} selectedItems={store.uistate.selectedItems}>
//                             <StoryObjectView store={store} object={object as AbstractStoryObject}>
//                                 <span class={`icon ${object.icon}`}>
//                                     <p>{object.name}</p>
//                                 </span> 
//                             </StoryObjectView>
//                         </MoveReceiver>
//                         })
//                     }
//             </div>
//         </DragReceiver>
//     }

//     private makeNewInstance(store: RootStore, input: string, loadedObject: IStoryObject, coords: { x: number; y: number; }) {
//         const instance = store.pluginStore.getNewInstance(input) as AbstractStoryObject;

//         if (instance) {
//             loadedObject.childNetwork?.addNode(store.storyContentObjectRegistry, instance);
//             if (instance.role === "internal.content.container") ((instance as Container).setup(store.storyContentObjectRegistry, store.uistate));           
//             store.uistate.selectedItems.setSelectedItems([instance.id]);
//             store.uistate.moveableItems.register(new MoveableItem(instance.id, coords.x, coords.y));
//         }
//     }

//     componentWillUnmount(): void {
//         this.disposeReaction();
//     }
// }

export const StoryObjectViewRenderer: FunctionalComponent = () => {
        const store = useContext(Store);
        const [,setState] = useState({});
        const loadedObjectId = store.uistate.loadedItem;
        const loadedObject = store.storyContentObjectRegistry.getValue(loadedObjectId);

        if (!loadedObject) throw("loadedObject is not defined");
        useEffect(() => {
            const disposeReaction = reaction(
                () => {
                    const id = store.uistate.loadedItem;
                    const network = store.storyContentObjectRegistry.getValue(id)?.childNetwork;
                    if (!network) throw("network ist not defined!");
                return {
                    id: id,
                    names: network.nodes.map(id => store.storyContentObjectRegistry.getValue(id)?.name),
                    edges: network.edges.map(e => e.id)
                }},
                (i) => {
                    console.log("I changed!", i);
                    setState({});
                }
            );

            return () => {
                disposeReaction();
            };
        })
        const makeNewInstance = (store: RootStore, input: string, loadedObject: IStoryObject, coords: { x: number; y: number; }) => {
            const instance = store.pluginStore.getNewInstance(input) as AbstractStoryObject;
    
            if (instance) {
                loadedObject.childNetwork?.addNode(store.storyContentObjectRegistry, instance);
                if (instance.role === "internal.content.container") ((instance as Container).setup(store.storyContentObjectRegistry, store.uistate));           
                store.uistate.selectedItems.setSelectedItems([instance.id]);
                store.uistate.moveableItems.register(new MoveableItem(instance.id, coords.x, coords.y));
            }
        }

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

                if (id) {
                    switch(loc) {
                        case "internal": {
                            switch(type) {
                                case "content": {
                                    makeNewInstance(store, input, loadedObject, coords);
                                    break;
                                }
                                case "container": {
                                    makeNewInstance(store, input, loadedObject, coords);
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
                id="node-editor"
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.id === "node-editor"){
                        store.uistate.selectedItems.clearSelectedItems();
                    }
                }
            }>
                <EdgeRenderer></EdgeRenderer>
                {
                    loadedObject.childNetwork?.nodes
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    .map(id => store.storyContentObjectRegistry.getValue(id))
                    .map((object) => {
                        if (object) return <MoveReceiver registry={store.uistate.moveableItems} id={object.id} selectedItems={store.uistate.selectedItems}>
                            <StoryObjectView store={store} object={object as AbstractStoryObject}>
                                <span class={`icon ${object.icon}`}>
                                    <p>{object.name}</p>
                                </span> 
                            </StoryObjectView>
                        </MoveReceiver>
                        })
                    }
            </div>
        </DragReceiver>
}
