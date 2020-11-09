import { reaction } from 'mobx';
import { Component, h } from 'preact';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { RootStore } from '../../store/rootStore';
import { UIStore } from '../../store/UIStore';
import { IPlugIn } from '../../utils/PlugInClassRegistry';
import { DragReceiver } from "../DragReceiver";

export interface IDummyObjectRendererProperties {
    store: RootStore
}

export class DummyObjectRenderer extends Component<IDummyObjectRendererProperties> {
    
    constructor(props: IDummyObjectRendererProperties) {
        super(props);

        reaction(
            () => (Array.from(props.store.storyContentObjectRegistry.registry).map(e => e[1].name)),
            () => {
                this.setState({});
            }
        )
    }
    
    render({store}: IDummyObjectRendererProperties): h.JSX.Element {
        return <DragReceiver 
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
                                    if (instance) {
                                        store.storyContentObjectRegistry.register(instance);
                                        store.uistate.setActiveItem(instance?.id);
                                    }
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
            <div id="hello-world" style="width: 100%; height: 100%;" onDblClick={(e) => {
                const target = e.target as HTMLElement;
                if (target.id === "hello-world"){
                    store.uistate.setActiveItem("");
                }
            }}>
                {
                    Array.from(store.storyContentObjectRegistry.registry)
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    .map(([_, object]) => (
                        <DummyObject store={store} object={object}>{object.name}</DummyObject>
                        ))
                    }
            </div>
        </DragReceiver>
    }
}

interface DummyObjectProperties {
    store: RootStore
    object: IStoryObject & IPlugIn
    children: string
}

export class DummyObject extends Component<DummyObjectProperties> {

    public active: boolean

    constructor(props: DummyObjectProperties) {
        super(props);

        this.active = props.store.uistate.activeitem === props.object.id;

        reaction(
            () => props.store.uistate.activeitem,
            (activeItem) => {
                if (props.object.id === activeItem) {
                    this.active = true;
                } else this.active = false;
                this.setState({});
            }
        );
    }

    render({ store, object, children}: DummyObjectProperties): h.JSX.Element {
        return <div
            onDblClick={(e) => {
                e.preventDefault();
                store.uistate.setActiveItem(object.id)
            }}
            class={(this.active) ? "dummy-object active" : "dummy-object inactive"}
        >{children}</div>
    }
}