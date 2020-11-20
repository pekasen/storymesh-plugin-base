import { reaction } from 'mobx';
import { Component, createContext, FunctionalComponent, h } from "preact";

import { Header } from './Header';
import { Pane, HorizontalPaneGroup, ResizablePane } from './Pane/Pane';
import { VerticalPane, VerticalPaneGroup, VerticalSmallPane, VerticalMiniPane } from './VerticalPane/VerticalPane';
import { Window, WindowContent } from "./Window";
import { RootStore } from '../store/rootStore';
import { ItemPropertiesView } from './ItemPropertiesView/ItemPropertiesView';
import { StoryObjectViewRenderer } from "./StoryObjectViewRenderer/StoryObjectViewRenderer";
import { BreadCrumb } from "./BreadCrumbs/BreadCrumbs";
import { IStoryObject } from 'storygraph';
import { Preview } from './Preview/Preview';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { GalleryItemView } from './GalleryItemView';
import { Store } from '..';
import { useContext, useEffect, useState } from 'preact/hooks';

export const App = (): h.JSX.Element => {

    const store = useContext(Store);

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
                rightToolbar={[
                    <button class="btn btn-default pull-right"
                    onClick={() => {
                        store.uistate.windowProperties.previewPane.toggleHidden();
                    }}>
                    <span class={"icon icon-right-dir"}></span>
                </button>
                ]}
            ></Header>
            <WindowContent>
                <EditorPaneGroup></EditorPaneGroup>
            </WindowContent>             
    </Window>
}


const EditorPaneGroup: FunctionalComponent = () => {
    const [_, setState] = useState({});

    const store = useContext(Store);

    useEffect(() => {
        const disposer = reaction(
            () => [store.uistate.loadedItem],
            () => setState({})
        );

        return () => {
            disposer();
        }
    });

    const loadedItem = store.storyContentObjectRegistry.getValue(
        store.uistate.loadedItem
    ) as IStoryObject;

    return <HorizontalPaneGroup>
        <ResizablePane paneState={store.uistate.windowProperties.sidebarPane} resizable="right" classes={["sidebar"]}>
            <ItemPropertiesView
                store={store}>
            </ItemPropertiesView>
        </ResizablePane>
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