import { reaction } from 'mobx';
import { Component, h } from "preact";
import { UIStore } from "../store/UIStore";
import { GalleryItemView } from './GalleryItemView';
import { Header } from './Header';
import { Pane, PaneGroup, SideBar } from './Pane';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { VerticalPane, VerticalPaneGroup, VerticalSmallPane } from './VerticalPane/VerticalPane';
import { Window, WindowContent } from "./Window";
 import { List } from "../store/List";
 import { ListItem } from "../store/ListItem";
import { DropzonePane } from "./DropzonePane";
// import { Toolbar } from "./Toolbar";

interface IAppProps {
    uistate: UIStore
}

export class App extends Component<IAppProps> {
    model = new List([
        new ListItem("Philipp", "Lead"),
        new ListItem("Jannik", "Frontend"),
        new ListItem("Anca", "Backend")
    ]);
    constructor (props: IAppProps) {
        super(props);

        reaction(
            () => ({
                file: props.uistate.file,
                sidebar: props.uistate.leftSidebar,
                hidden: props.uistate.leftSidebar
            }),
            () => {
                this.setState({});
        });
    }

    public render({ uistate }: IAppProps): h.JSX.Element {
        return <Window>
                <Header
                    title={uistate.windowProperties.title}
                    leftToolbar={[
                    <button class="btn btn-default"
                        onClick={() =>{
                            uistate.toggleSidebar();
                        }}>
                        <span class="icon icon-left-dir"></span>
                    </button>]}
                ></Header>
                <WindowContent>
                    <PaneGroup>
                        <SideBar></SideBar>
                        <Pane>
                            <VerticalPaneGroup>
                                <VerticalPane>
                                    <canvas height={400} width={400}></canvas>
                                </VerticalPane>
                                {
                                    // TODO: this Component should be resized to full height minus of the component below.
                                }
                                <VerticalSmallPane>
                                    <DropzonePane uistate={uistate} model={this.model}></DropzonePane>
                                    <StoryComponentGallery>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Text</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Image</p></GalleryItemView>
                                        <GalleryItemView item={{id: "asdoasmdas"}}><p>Video</p></GalleryItemView>
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
