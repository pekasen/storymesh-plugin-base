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
                file: props.store.uistate.file,
                sidebar: props.store.uistate.leftSidebar,
                hidden: props.store.uistate.leftSidebar
            }),
            () => {
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
                        <SideBar></SideBar>
                        <Pane>
                            <VerticalPaneGroup>
                                <DragReceiver onDrop={(e) => {
                                    e.preventDefault();
                                    const id = e.dataTransfer?.getData("text") || undefined;
                                    console.log(id);
                                }}>
                                    <div class="vertical-pane">
                                        <Canvas></Canvas>
                                    </div>
                                    {/* <VerticalPane>
                                    </VerticalPane> */}
                                </DragReceiver>
                                {
                                    // TODO: this Component should be resized to full height minus of the component below.
                                }
                                <VerticalSmallPane>
                                    <StoryComponentGallery>
                                        {
                                            // TODO: compute gallery items from plugin registry
                                            // store.storyComponentRegistry.registry.values().
                                        }
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Text</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Image</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Video</p></GalleryItemView>
                                        <GalleryItemLiner></GalleryItemLiner>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Audio</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Image Gallery</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Cats</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Dogs</p></GalleryItemView>
                                    </StoryComponentGallery>
                                </VerticalSmallPane>
                            </VerticalPaneGroup>
                        </Pane>
                    </PaneGroup>
                </WindowContent>             
        </Window>
    }
}
