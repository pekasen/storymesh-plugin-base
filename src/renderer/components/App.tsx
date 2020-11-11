import { reaction } from 'mobx';
import { Component, FunctionalComponent, h } from "preact";

import { GalleryItemView } from './GalleryItemView';
import { Header } from './Header';
import { Pane, PaneGroup, SideBar } from './Pane';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { VerticalPane, VerticalPaneGroup, VerticalSmallPane } from './VerticalPane/VerticalPane';
import { Window, WindowContent } from "./Window";
import { RootStore } from '../store/rootStore';
import { ItemPropertiesView } from './ItemPropertiesView/ItemPropertiesView';
import { DummyObjectRenderer } from "./DummyObjectRenderer/DummyObjectRenderer";

import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';

interface IAppProps {
    store: RootStore
}

export class App extends Component<IAppProps> {

    constructor (props: IAppProps) {
        super(props);

        reaction(
            () => [props.store.uistate.selectedItem, props.store.uistate.loadedItem],
            () => this.setState({})
        );
    }

    public render({ store }: IAppProps): h.JSX.Element {
        return <Window>
                <Header
                    title={store.uistate.windowProperties.title}
                    leftToolbar={[
                    <button class="btn btn-default"
                        onClick={() =>{
                            store.uistate.toggleSidebar();
                        }}>
                        <span class="icon icon-left-dir"></span>
                    </button>]}
                ></Header>
                <WindowContent>
                    <EditorPaneGroup store={store} loadedItem={store.storyContentObjectRegistry.getValue(store.uistate.loadedItem) as IStoryObject}></EditorPaneGroup>
                </WindowContent>             
        </Window>
    }
}

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
    
    return <div class="vertical-pane-group">
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

interface EditorPaneGroupProperties {
    loadedItem: IStoryObject
    store: RootStore
}

const EditorPaneGroup: FunctionalComponent<EditorPaneGroupProperties> = ({loadedItem, store}) => {
    return <PaneGroup>
        <SideBar>
            <ItemPropertiesView
                template={
                    (() => {
                        const res = store.
                        storyContentObjectRegistry.
                        getValue(store.uistate.selectedItem);
                        return res?.
                        menuTemplate;
                    })()
                }
                store={store.uistate}>
            </ItemPropertiesView>
        </SideBar>
        {/* <DropzonePane uistate={store.uistate} model={store.model}></DropzonePane> */}
        <Pane>
            <VerticalPaneGroup>
                <VerticalPane>
                    <BreadCrumb store={store} loadedObject={loadedItem}></BreadCrumb>
                </VerticalPane>
                <VerticalPane>
                        <DummyObjectRenderer loadedObject={loadedItem} store={store}>
                        </DummyObjectRenderer>
                </VerticalPane>
                <VerticalSmallPane>
                    <StoryComponentGallery>
                        {
                            // TODO: compute gallery items from plugin registry
                            Array.from(store.storyContentTemplatesRegistry.registry).map(([, item]) => (
                                <GalleryItemView item={{id: item.id}}><p>{item.name}</p></GalleryItemView>
                            ))
                        }
                    </StoryComponentGallery>
                </VerticalSmallPane>
            </VerticalPaneGroup>
        </Pane>
    </PaneGroup>
};
