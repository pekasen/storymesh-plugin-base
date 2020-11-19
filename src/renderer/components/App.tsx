import { reaction } from 'mobx';
import { Component, FunctionalComponent, h } from "preact";

import { Header } from './Header';
import { Pane, HiddeableSideBar, HorizontalPaneGroup, ResizablePane } from './Pane/Pane';
import { VerticalPane, VerticalPaneGroup, VerticalSmallPane, VerticalMiniPane } from './VerticalPane/VerticalPane';
import { Window, WindowContent } from "./Window";
import { RootStore } from '../store/rootStore';
import { ItemPropertiesView } from './ItemPropertiesView/ItemPropertiesView';
import { StoryObjectViewRenderer } from "./StoryObjectViewRenderer/StoryObjectViewRenderer";
import { BreadCrumb } from "./BreadCrumbs/BreadCrumbs";
import { IStoryObject } from 'storygraph';
import { Preview } from './Preview/Preview';
import { ConnectorView } from './Connector/ConnectorView';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { GalleryItemView } from './GalleryItemView';

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
                            store.uistate.windowProperties.sidebarPane.toggleHidden();
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
    return <HorizontalPaneGroup>
        <ResizablePane paneState={store.uistate.windowProperties.sidebarPane} resizable="right" classes={["sidebar"]}>
            <ItemPropertiesView
                store={store}>
            </ItemPropertiesView>
        </ResizablePane>
        {/* <DropzonePane uistate={store.uistate} model={store.model}></DropzonePane> */}
        <Pane>
            <VerticalPaneGroup>
                <VerticalMiniPane>
                    <BreadCrumb store={store} loadedObject={loadedItem}></BreadCrumb>
                </VerticalMiniPane>
                <VerticalPane>
                        <StoryObjectViewRenderer loadedObject={loadedItem} store={store}>
                        </StoryObjectViewRenderer>
                </VerticalPane>
                <VerticalSmallPane>
                    <StoryComponentGallery>    
                        {
                            Array.from(store.storyContentTemplatesRegistry.registry).map(([, item]) => (
                                <GalleryItemView item={item}>
                                    <span>{item.name}</span>
                                </GalleryItemView>
                                // <ConnectorView item={{id: item.id}} onDrag={() => {
                                //     console.log("connector message");
                                // }}><span>{item.name}</span></ConnectorView>
                            ))
                        }
                    </StoryComponentGallery>
                </VerticalSmallPane>
            </VerticalPaneGroup>
        </Pane>
        <ResizablePane paneState={store.uistate.windowProperties.previewPane} resizable="left">
            <Preview
                topLevelObjectId={store.uistate.topLevelObjectID}
                id={"g"}
                graph={store.storyContentObjectRegistry.getValue(store.uistate.topLevelObjectID)?.childNetwork}
                registry={store.storyContentObjectRegistry}
            >
            </Preview>
        </ResizablePane >
    </HorizontalPaneGroup>
};
