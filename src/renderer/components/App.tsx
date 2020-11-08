import { reaction } from 'mobx';
import { Component, h } from "preact";
import { UIStore } from "../store/UIStore";
import { DragReceiver } from './DragReceiver';
import { GalleryItemLiner, GalleryItemView } from './GalleryItemView';
import { Header } from './Header';
import { Pane, PaneGroup, SideBar } from './Pane';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { VerticalPane, VerticalPaneGroup, VerticalSmallPane } from './VerticalPane/VerticalPane';
import { Window, WindowContent } from "./Window";
import { Canvas } from "./Canvas";
import { RootStore } from '../store/RootStore';
import { DropzonePane } from './DropzonePane';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { ItemPropertiesView } from './ItemPropertiesView/ItemPropertiesView';
// import { List } from "../store/List";
// import { DropzonePane } from "./DropzonePane";
// import { Toolbar } from "./Toolbar";

interface IAppProps {
    store: RootStore
}

export class App extends Component<IAppProps> {

    constructor (props: IAppProps) {
        super(props);

        reaction(
            () => ({
                activeItem: props.store.storyContentObjectRegistry.registry.size 
            }),
            () => {
                const id = Array.from(this.props.store.storyContentObjectRegistry.registry).pop()?.[1].id || "";
                console.log("App Reaction", id);
                props.store.uistate.setActiveItem(id);
                this.setState({});
        });
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
                    <PaneGroup>
                        <SideBar>
                            <ItemPropertiesView
                                template={
                                    (() => {
                                        const res = store.
                                        storyContentObjectRegistry.
                                        getRegisteredValue(store.uistate.activeitem)

                                        console.log("Template CallBack", res, store.uistate.activeitem);
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
                                {
                                    // TODO: this Component should be resized to full height minus of the component below.
                                }
                                <VerticalPane>
                                    <DragReceiver 
                                    onDrop={(e) => {
                                        const input = e.dataTransfer?.getData('text');

                                        if (input) {
                                            const [loc, type, id] = input.split(".");
                                        
                                            console.log("Hello");
                                            if (id) {
                                                switch(loc) {
                                                    case "internal": {
                                                        switch(type) {
                                                            case "content": {
                                                                const instance = store.storyContentTemplatesRegistry.getNewInstance(input);
                                                                console.log(instance);
                                                                if (instance) store.storyContentObjectRegistry.registerValue(
                                                                {
                                                                    id: instance.id,
                                                                    value: instance
                                                                })
                                                                if (instance?.id) store.uistate.setActiveItem(instance?.id);
                                                                break;
                                                            }
                                                            default: break;
                                                        }
                                                        break;
                                                    }
                                                    case "external": {
                                                        break;
                                                    }
                                                    default: break;
                                                }
                                            }
                                        }
                                        console.log(store.storyContentObjectRegistry)
                                    }}>
                                        <div id="hello-world" style="width: 100%; min-height: 300px;">
                                            {
                                                Array.from(store.storyContentObjectRegistry.registry)
                                                .map(([_, object]) => (
                                                <div onClick={() => store.uistate.setActiveItem(object.id)}>{object.id + " " + object.metaData}</div>
                                                ))
                                            }
                                        </div>
                                    </DragReceiver>
                                </VerticalPane>
                                <VerticalSmallPane>
                                    <StoryComponentGallery>
                                        {
                                            // TODO: compute gallery items from plugin registry
                                            Array.from(store.storyContentTemplatesRegistry.registry).map(([key, item]) => (
                                                <GalleryItemView item={{id: item.id}}><p>{item.name}</p></GalleryItemView>
                                            ))
                                        }
                                        {/* <GalleryItemView item={{id: "asdoasmdas"}}><p>Text</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Image</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Video</p></GalleryItemView>
                                        <GalleryItemLiner></GalleryItemLiner>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Audio</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Image Gallery</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Cats</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Dogs</p></GalleryItemView> */}
                                    </StoryComponentGallery>
                                </VerticalSmallPane>
                            </VerticalPaneGroup>
                        </Pane>
                    </PaneGroup>
                </WindowContent>             
        </Window>
    }
}
