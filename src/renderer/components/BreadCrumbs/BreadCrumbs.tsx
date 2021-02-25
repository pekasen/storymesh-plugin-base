import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from "preact";
import { useContext } from 'preact/hooks';
import { IStoryObject } from "storygraph";
import { Store } from '../..';
import { RootStore } from "../../store/rootStore";

interface IBreadCrumbPropeties {
    loadedObject: IStoryObject
    store: RootStore
}

export class BreadCrumb extends Component<IBreadCrumbPropeties>
{
    // reactionDisposer: IReactionDisposer

    constructor(props: IBreadCrumbPropeties) {
        super(props);

         // TODO: this reaction increases it's call count with each call!!
        // this.reactionDisposer = reaction(
        //     () => props.store.uistate.selectedItems.ids,
        //     (ids: string[]) => {
        //         this.setState({
        //             ids: ids
        //         });
        //     }
        // );
    }

    render({ loadedObject }: IBreadCrumbPropeties): h.JSX.Element {
        const { storyContentObjectRegistry, uistate } = useContext(Store);

        const recursePath = ( obj: IStoryObject ): IStoryObject[] => {
            const res: IStoryObject[] = [];
            res.push(obj);
   
            if (obj && obj.parent) {
                const rObj = storyContentObjectRegistry.getValue(obj.parent);
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
                            onClick={() => uistate.selectedItems.setSelectedItems([e.id])}
                            onDblClick={() => uistate.setLoadedItem(e.id)}>
                            {e.name}
                        </li>
                    ))
                }
                {
                    (() => {
                        const selectedItems = uistate.selectedItems.size;

                        switch(selectedItems) {
                            case 0: {
                                return null
                            }
                            case 1: {
                                return <li class="item selected">{
                                    storyContentObjectRegistry.getValue(uistate.selectedItems.first)?.name
                                    }</li>
                            }
                            default: {
                                return <li class="item selected">{`${selectedItems} items`}</li>
                            }
                        }
                    })()
                }
            </ul>
        </div>
    }

    componentWillUnmount(): void {
        // this.reactionDisposer();
    }
}
