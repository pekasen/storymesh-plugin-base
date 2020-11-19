import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { RootStore } from '../../store/rootStore';
import { ConnectorView } from '../Connector/ConnectorView';
import { Draggable } from '../Draggable';
import { MoveSender } from '../Moveable';
import { TwoJS } from '../TwoJS';



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

interface StoryObjectViewProperties {
    store: RootStore;
    object: IStoryObject;
    children: string;
}
