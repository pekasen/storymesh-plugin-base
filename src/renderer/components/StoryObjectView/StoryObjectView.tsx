import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { AbstractStoryObject } from '../../../plugins/helpers/AbstractStoryObject';
import { AbstractStoryModifier } from '../../../plugins/helpers/AbstractModifier';
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
        // const EditorComponent: FunctionComponent<INGWebSProps> = object.getEditorComponent();
        // <Draggable id={object.id}>
        const item = store.uistate.moveableItems.getValue(object.id);

        return <div class="outer" onDrop={(event) => {
            const data = event.dataTransfer?.getData("text");
            if (data) {
                const path = data.split(".");
                if (path[1] === "modifier") {
                    const modifier = store.pluginStore.getNewInstance(data) as AbstractStoryModifier;
                    object.addModifier(modifier);
                }
            }
        }}>
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
                    if (object.role === "internal.content.container") {
                        store.uistate.setLoadedItem(object.id);
                    }
                }}
                class={`story-object-view ${(store.uistate.selectedItems.isSelected(object.id)) ? "active" : "inactive"}`}
            >
                <MoveSender registry={store.uistate.moveableItems} selectedItems={store.uistate.selectedItems} id={object.id}>
                    <div class={`area-meta`}>
                        {children}
                        <div onClick={(e) => {
                            e.preventDefault();
                            item?.toggleCollapse()
                            // const toggle = document.getElementById('toggle-content');
                            // const contentArea = document.getElementById('area-content');
                            // toggle?.classList.toggle('minimized');
                            // contentArea?.classList.toggle('hidden');
                        }}
                            class={`toggle-content ${(item?.collapsed) ? "minimized" : ""}`} id="toggle-content">
                            <span class="span-top"></span>
                            <span class="span-bottom"></span>
                        </div>
                    </div>
                </MoveSender>
                <div class={`area-content ${(item?.collapsed) ? "hidden" : ""}`} id="area-content">
                    <span>{object.content?.resource}</span>
                </div>
                {
                    Array.from(object.connectors).map(a => {
                        const [, obj] = a;
                        return <ConnectorView class={obj.type + " " + obj.direction} id={object.id + "." + obj.name}></ConnectorView>
                    })
                }
            </div>
        </div>;
        // </Draggable>;
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
interface StoryObjectViewProperties {
    store: RootStore;
    object: AbstractStoryObject;
    children: h.JSX.Element;
}
