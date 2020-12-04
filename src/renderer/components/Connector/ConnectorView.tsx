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
                obj.updateConnections(
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
        }}> 
            <span id={id} class={this.class}>{children}</span>
        </DraggableDropReceiver>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }

    onDrag(id: string): void {   
        console.log("drag", id);
    }

    // shouldn't we use a big arrow function? That would allow us to capture _this_ and use it in the callback.
    onDrop(ev: DragEvent): void {
       return
    }
}
