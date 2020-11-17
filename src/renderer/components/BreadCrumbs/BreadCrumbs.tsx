import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from "preact";
import { IStoryObject } from "storygraph";
import { RootStore } from "../../store/rootStore";

interface IBreadCrumbPropeties {
    loadedObject: IStoryObject
    store: RootStore
}

export class BreadCrumb extends Component<IBreadCrumbPropeties>
{
    reactionDisposer: IReactionDisposer

    constructor(props: IBreadCrumbPropeties) {
        super(props);

         // TODO: this reaction increases it's call count with each call!!
        this.reactionDisposer = reaction(
            () => [...props.store.uistate.selectedItems.ids],
            () => {
                this.setState({});
            }
        );
    }

    render({ store, loadedObject }: IBreadCrumbPropeties): h.JSX.Element {
        const recursePath = ( obj: IStoryObject ): IStoryObject[] => {
            const res: IStoryObject[] = [];
            res.push(obj);
   
            if (obj.parent) {
                const rObj = store.storyContentObjectRegistry.getValue(obj.parent);
                if (rObj) {
                    const r = recursePath(rObj);
                    if (r) res.push(...r)
                }
            }
    
            return res
        }
        const path = recursePath(loadedObject);

        return <div class="breadcrumb-container">
            <ul>
                {
                    path?.reverse().map(e => (
                        <li
                            class="item"
                            onClick={() => store.uistate.selectedItems.setSelectedItems([e.id])}
                            onDblClick={() => store.uistate.setLoadedItem(e.id)}>
                            {e.name}
                        </li>
                    ))
                }
                {
                    (() => {
                        const selectedItems = store.uistate.selectedItems.size;

                        switch(selectedItems) {
                            case 0: {
                                return null
                            }
                            case 1: {
                                return <li class="item selected">{
                                    store.storyContentObjectRegistry.getValue(store.uistate.selectedItems.first)?.name
                                    }</li>
                            }
                            default: {
                                return <li class="item selected">Multiselection</li>
                            }
                        }
                    })()
                }
            </ul>
        </div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
