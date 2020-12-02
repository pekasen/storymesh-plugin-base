import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { MoveableItem } from '../../store/MoveableItem';
import { Draggable } from '../Draggable';
import { DragReceiver } from '../DragReceiver';

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
        return <DragReceiver onDrop={this.onDrop(id)}>
                    <Draggable id={id} onDrag={this.onDrag(id)}>
                        <span id={id} class={this.class}>{children}</span>
                    </Draggable>
                </DragReceiver>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }

    onDrag(id: string): void {
        console.log("drag", id);
    }

    onDrop(id: string): void {
        console.log("drop", id);
    }

}
