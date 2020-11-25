import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { MoveableItem } from '../../store/MoveableItem';
import { Draggable } from '../Draggable';
import { IItem } from '../IItem';

interface IConnectorViewProps<T extends MoveableItem> {
    id: string
    item: MoveableItem
    onClick?: () => void    
    onDblClick?: () => void
    onDrag?: () => void
    children?: h.JSX.Element
}

export class ConnectorView extends Component<IConnectorViewProps<MoveableItem>> {

    reactionDisposer: IReactionDisposer;

    constructor(props: IConnectorViewProps<MoveableItem>) {
        super(props);

        this.reactionDisposer = reaction(
            () => ({ ...props }),
            () => {
                this.setState({});
            }
        );
    }
    
    render({ id, children, onDrag }: IConnectorViewProps<MoveableItem>): h.JSX.Element {
        return <Draggable id={id}> 
            <span  id={id} class="connector" onDrag={onDrag}>{children}</span>
        </Draggable>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
