import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { MoveableItem } from '../../store/MoveableItem';
import { RootStore } from '../../store/rootStore';
import { ConnectorView } from '../Connector/ConnectorView';
import { Draggable } from '../Draggable';
import { DragReceiver } from "../DragReceiver";
import { MoveReceiver, MoveSender } from '../Moveable';
import { TwoJS } from '../TwoJS';

export interface IStoryObjectViewRendererProperties {
    loadedObject: IStoryObject
    store: RootStore
}

export class StoryObjectViewRenderer extends Component<IStoryObjectViewRendererProperties> {
    
    disposeReaction: IReactionDisposer
    two: TwoJS;
    constructor(props: IStoryObjectViewRendererProperties) {
        super(props);
        this.two = new TwoJS({noodles: props.loadedObject.childNetwork?.edges, uistate: props.store.uistate});

        this.disposeReaction = reaction(
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
    
    render({loadedObject, store}: IStoryObjectViewRendererProperties): h.JSX.Element {    
        
        return <DragReceiver         
        onDrop={(e) => {
            const input = e.dataTransfer?.getData('text');
            const bounds = (e.target as HTMLElement).getBoundingClientRect()
            const coords = {
                x: e.x - bounds.left,
                y: e.y - bounds.top
            };

            console.log("coords", coords);
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
                this.two.updateMyNoodles(loadedObject.childNetwork?.edges);
            }
            /*console.log(store.storyContentObjectRegistry);
            console.log("Connectors", loadedObject.connectors);
            console.log("Connections", loadedObject.connections);
              */     
        }
        }>
            <div
                id="hello-world"
                onClick={(e) => {
                    const target = e.target as HTMLElement;
                    if (target.id === "hello-world"){
                        store.uistate.selectedItems.setSelectedItems([]);
                    }             
                    console.log("hello click");                       
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
                        //  <TwoJS noodles={loadedObject.childNetwork?.edges} uistate={store.uistate}></TwoJS>  
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

interface StoryObjectViewProperties {
    store: RootStore
    object: IStoryObject
    children: string
}

export class StoryObjectView extends Component<StoryObjectViewProperties> {

    reactionDisposer: IReactionDisposer
    two: TwoJS;
    constructor(props: StoryObjectViewProperties) {
        super(props);
        this.two = new TwoJS({noodles: props.object.childNetwork?.edges, uistate: props.store.uistate});
        this.reactionDisposer = reaction(
            () => ([...props.store.uistate.selectedItems.ids, props.object.name, props.object.content?.resource]),
            () => {
                this.setState({});
            }
        );
    }

    render({ store, object, children}: StoryObjectViewProperties): h.JSX.Element {
        
        const obj = store.uistate.moveableItems.registry.get(object.id);
        const nudle = this.two.drawNoodleCurve(100, 100, 400, 400);
        if (obj) 
             this.two.redrawNoodleCurve(nudle, obj.x, obj.y, obj.x, obj.y);
        const connectorPorts = object.connectors.map(() => {
            return <ConnectorView id={object.id} onDrag={(e: DragEvent)=> { 
                if (obj)
                    this.two.redrawNoodleCurve(nudle, obj.x, obj.y, e.clientX, e.clientY);
                 }}></ConnectorView>
        }) 
        /*connectorPorts.map((dragTarget) => {
            dragTarget.addEventListener("dragend", function(ev: DragEvent) {
                // Call the drag and drop data processor
                if (ev.dataTransfer !== null) 
                    console.log("drag connector");
            }, false);
        })*/

        return <Draggable id={object.id}>            
            <div class="outer">                    
            {connectorPorts}  
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
                    class="story-object-view"
                >            
                    <MoveSender registry={store.uistate.moveableItems} selectedItems={store.uistate.selectedItems} id={object.id}>
                    <div class={`area-meta ${(store.uistate.selectedItems.isSelected(object.id)) ? "active" : "inactive"}`}>
                        {children}
                    </div>
                    </MoveSender>
                    <div class="area-content">
                        <span>{object.content?.resource}</span>
                    </div>
                </div>
            </div>
        </Draggable>
    }

    componentWillUnmount(): void {
        this.reactionDisposer()
    }
    componentDidMount(): void {
        this.two.svg.appendTo(document.getElementById("hello-world") as HTMLElement);
    }
}
