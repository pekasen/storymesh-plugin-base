import { reaction } from 'mobx';
import { Component, FunctionalComponent, h } from "preact";

import { GalleryItemView } from './GalleryItemView';
import { Header } from './Header';
import { Pane, PaneGroup, SideBar, HiddeableSideBar, HorizontalPaneGroup } from './Pane';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { VerticalPane, VerticalPaneGroup, VerticalSmallPane, VerticalMiniPane } from './VerticalPane/VerticalPane';
import { Window, WindowContent } from "./Window";
import { DropzonePane } from "./DropzonePane";
import { RootStore } from '../store/rootStore';
import { ItemPropertiesView } from './ItemPropertiesView/ItemPropertiesView';
import { DummyObjectRenderer } from "./DummyObjectRenderer/DummyObjectRenderer";
import { BreadCrumb } from "./BreadCrumbs/BreadCrumbs";
import { IStoryObject } from 'storygraph';
import { Preview } from './Preview/Preview';
import { ConnectorView } from './Connector/ConnectorView';

interface IAppProps {
    store: RootStore
}

export class App extends Component<IAppProps> {

    constructor (props: IAppProps) {
        super(props);

        reaction(
            () => [props.store.uistate.loadedItem],
            () => this.setState({})
        );
    }

    public render({ store }: IAppProps): h.JSX.Element {
        return <Window>
                <Header
                    title={store.uistate.windowProperties.title}
                    leftToolbar={[
                    <button class="btn btn-default"
                        onClick={() => {
                            console.log("Hello");
                            store.uistate.toggleSidebar("left");
                        }}>
                        <span class={"icon icon-left-dir"}></span>
                    </button>]}
                ></Header>
                <WindowContent>
                    <EditorPaneGroup store={store} loadedItem={store.storyContentObjectRegistry.getValue(store.uistate.loadedItem) as IStoryObject}></EditorPaneGroup>
                </WindowContent>             
        </Window>
    }
}

interface EditorPaneGroupProperties {
    loadedItem: IStoryObject
    store: RootStore
}

const EditorPaneGroup: FunctionalComponent<EditorPaneGroupProperties> = ({loadedItem, store}) => {
    return <PaneGroup>
        <HorizontalPaneGroup>
        <HiddeableSideBar uistate={store.uistate}>
            <ItemPropertiesView
                store={store}>
            </ItemPropertiesView>
        </HiddeableSideBar>
        {/* <DropzonePane uistate={store.uistate} model={store.model}></DropzonePane> */}
        <Pane>
            <VerticalPaneGroup>
                <VerticalMiniPane>
                    <BreadCrumb store={store} loadedObject={loadedItem}></BreadCrumb>
                </VerticalMiniPane>
                <VerticalPane>
                        <DummyObjectRenderer loadedObject={loadedItem} store={store}>
                        </DummyObjectRenderer>
                </VerticalPane>
                <VerticalSmallPane>
                    {
                        Array.from(store.storyContentTemplatesRegistry.registry).map(([, item]) => (
                            <ConnectorView item={{id: item.id}} onDrag={() => {
                                console.log("connector message");
                            }}><span>{item.name}</span></ConnectorView>
                        ))
                    }
                {/*  
                    <StoryComponentGallery>
                        {
                            // TODO: compute gallery items from plugin registry
                            Array.from(store.storyContentTemplatesRegistry.registry).map(([, item]) => (
                                <GalleryItemView item={{id: item.id}}><span>{item.name}</span></GalleryItemView>
                            ))
                        }
                    </StoryComponentGallery>
                */}
                </VerticalSmallPane>
            </VerticalPaneGroup>
        </Pane>
        <Pane>
            <Preview
                topLevelObjectId={store.uistate.topLevelObjectID}
                id={"g"}
                graph={store.storyContentObjectRegistry.getValue(store.uistate.topLevelObjectID)?.childNetwork}
                registry={store.storyContentObjectRegistry}
            >
            </Preview>
        </Pane>
        </HorizontalPaneGroup>
    </PaneGroup>
};
