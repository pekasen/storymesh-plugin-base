import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { Draggable } from '../Draggable';
import { IItem } from '../IItem';

interface IConnectorViewProps<T extends IItem> {
    item: T
    onClick?: () => void
    onDblClick?: () => void
    onDrag?: () => void
    children: h.JSX.Element
}

export class ConnectorView extends Component<IConnectorViewProps<IItem>> {

    reactionDisposer: IReactionDisposer;

    constructor(props: IConnectorViewProps<IItem>) {
        super(props);

        this.reactionDisposer = reaction(
            () => ({ ...props.item }),
            () => {
                this.setState({});
            }
        );
    }
    
    render({ item, children, onDrag }: IConnectorViewProps<IItem>): h.JSX.Element {
        return <Draggable id={item.id}> 
            <span class="connector" onDrag={onDrag}>{children}</span>
        </Draggable>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
