import { reaction } from 'mobx';
import { Component, h } from "preact";
import { DragReceiver } from './DragReceiver';
import { GalleryItemView } from './GalleryItemView';
import { Header } from './Header';
import { Pane, PaneGroup, SideBar } from './Pane';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { VerticalPane, VerticalPaneGroup, VerticalSmallPane } from './VerticalPane/VerticalPane';
import { Window, WindowContent } from "./Window";
import { RootStore } from '../store/RootStore';
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
            () => (props.store.storyContentObjectRegistry.registry.size),
            () => {
                const id = Array.from(this.props.store.storyContentObjectRegistry.registry).pop()?.[1].id || "";
                console.log("App Reaction", id);
                props.store.uistate.setActiveItem(id);
                this.setState({});
        });
        reaction(
            () => ([props.store.uistate.activeitem, ...Array.from(props.store.storyContentObjectRegistry.registry).map(e => e[1].name)]),
            () => {this.forceUpdate()}
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
                                                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                                .map(([_, object]) => (
                                                <div onDblClick={() => store.uistate.setActiveItem(object.id)}>{object.name}</div>
                                                ))
                                            }
                                        </div>
                                    </DragReceiver>
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
                </WindowContent>             
        </Window>
    }
}
