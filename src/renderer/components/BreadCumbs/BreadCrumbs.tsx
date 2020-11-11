import { FunctionalComponent, h } from "preact";
import { IStoryObject } from "storygraph";
import { RootStore } from "../../store/rootStore";

interface IBreadCrumbPropeties {
    loadedObject: IStoryObject
    store: RootStore
}

export const BreadCrumb: FunctionalComponent<IBreadCrumbPropeties> = ({ store, loadedObject }) => {
    
    const recursePath = ( obj: IStoryObject ): IStoryObject[] => {
        const res: IStoryObject[] = [];
        res.push(obj);
        console.log(res);

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
    
    return <div class="breadcumb-container">
        <ul>
            {
                path?.reverse().map(e => (
                    <li class="breadcrumb-item" onDblClick={() => store.uistate.setLoadedItem(e.id)}>
                        {e.name}
                    </li>
                ))
            }
            {
                (store.uistate.selectedItem !== "") ?
                (<li class="breadcrumb-item selected-item">{store.storyContentObjectRegistry.getValue(store.uistate.selectedItem)?.name}</li>) :
                null
            }
        </ul>
    </div>
}
