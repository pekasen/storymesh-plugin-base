import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { RootStore } from '../../store/rootStore';
import { ConnectorView } from '../Connector/ConnectorView';
import { Draggable } from '../Draggable';
import { MoveSender } from '../Moveable';


export class StoryObjectView extends Component<StoryObjectViewProperties> {

    reactionDisposer: IReactionDisposer;

    constructor(props: StoryObjectViewProperties) {
        super(props);

        this.reactionDisposer = reaction(
            () => ([...props.store.uistate.selectedItems.ids, props.object.name, props.object.content?.resource]),
            () => {
                this.setState({});
            }
        );
    }

    render({ store, object, children }: StoryObjectViewProperties): h.JSX.Element {

        


        return <Draggable id={object.id}>
            <div class="outer">
                {
                    object.connectors.map(obj => {
                        console.log(obj.type);
                        return <ConnectorView class={obj.type + " " + obj.direction} id={object.id + "." + obj.name}></ConnectorView>
                    })                    
                }
                
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
                        if (object.role === "container") {
                            store.uistate.setLoadedItem(object.id);
                        }
                    }}
                    class={`story-object-view ${(store.uistate.selectedItems.isSelected(object.id)) ? "active" : "inactive"}`}
                >
                    <MoveSender registry={store.uistate.moveableItems} selectedItems={store.uistate.selectedItems} id={object.id}>
                        <div class={`area-meta`}>
                            {children}
                        </div>
                    </MoveSender>
                    <div class="area-content">
                            <span>{object.content?.resource}</span>
                    </div>
                </div>
            </div>
        </Draggable>;
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
interface StoryObjectViewProperties {
    store: RootStore;
    object: IStoryObject;
    children: h.JSX.Element;
}
