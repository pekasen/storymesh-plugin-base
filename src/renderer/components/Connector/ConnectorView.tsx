import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useContext } from 'preact/hooks';
import { StoryGraph } from 'storygraph';
import { Store } from '../..';
import { DraggableDropReceiver } from '../DraggableDragReceiver';

interface IConnectorViewProps {
    id: string
    class: string
    onClick?: () => void    
    onDblClick?: () => void
    //onDrag?: () => void
    children?: h.JSX.Element
}

export class ConnectorView extends Component<IConnectorViewProps> {

    reactionDisposer: IReactionDisposer;
    class: string;

    constructor(props: IConnectorViewProps) {
        super(props);
        this.class = props.class;

        this.reactionDisposer = reaction(
            () => ({ ...props }),
            () => {
                this.setState({});
            }
        );
    }
    
    render({ id, children }: IConnectorViewProps): h.JSX.Element {
        // onDrag={this.onDrag(id)}
        const { storyContentObjectRegistry } = useContext(Store);
        const [fromId, fromPort] = StoryGraph.parseNodeId(id);
        const obj = storyContentObjectRegistry.getValue(fromId);

        return <DraggableDropReceiver id={id} onDrop={(ev: DragEvent) => {
            ev.preventDefault();

            const _id = ev.dataTransfer?.getData("text");
            console.log("received drop from", _id);
            if (_id && obj) {
                const [toId, toPort] = StoryGraph.parseNodeId(_id);
                obj.addConnection(
                    storyContentObjectRegistry,
                    toId,
                    fromPort,
                    toPort,
                    (fromPort.endsWith("in") ? "in" : "out")
                )        
            //     network = parentObj?.childNetwork
                
            //     network.connect(storyContentObjectRegistry, [{
            //         from: id,
            //         to: _id,
            //         id: ["edge-",id,"-",_id].join("")
            //     }])
                    }
                }
            }
            onDragStart={() => {
                    const spanRef = document.getElementById(id);
                    const rect = spanRef?.getBoundingClientRect();
                    let xSpan = 0;
                    let ySpan = 0;
                    if (rect) {
                        xSpan = rect.left + (rect.width / 2);
                        ySpan = rect.top + (rect.height / 2);
                    } else {
                        xSpan = 0;
                        ySpan = 0;
                    }
                    // create and dispatch the event
                    const event = new CustomEvent("ConnectorDragStart", {
                        detail: {
                            x: xSpan,
                            y: ySpan
                        }
                    });
                    document.dispatchEvent(event);
                }   
            }>
            <span id={id} class={this.class}>{children}</span>
        </DraggableDropReceiver>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
