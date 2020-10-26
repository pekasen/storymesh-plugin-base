import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { ListItem } from "../store/ListItem";

interface IListItemViewProps {
    item: ListItem;
    onClick?: () => void;
    onDblClick?: () => void;
}

export class ListItemView extends Component<IListItemViewProps, {}> {

    reactionDisposer: IReactionDisposer;

    constructor(props: IListItemViewProps) {
        super(props);

        this.reactionDisposer = reaction(
            () => ({ ...props.item }),
            () => {
                this.setState({});
            }
        );
    }
    
    render({ item, onClick }: IListItemViewProps) {
        return <li
            class="list-group-item"
            onClick={onClick}
            // onDblClick={onDblClick}
            draggable={true}
            onDragStart={e => {
                if (e.target) {
                    e.dataTransfer?.setData("text", JSON.stringify(item));
                }
            }}>
            <span class="icon icon-user img-circle media-object pull-left"></span>
            <div class="media-body">
                <strong>{`${item.name}`}</strong><br></br>
                {`${item.type ? item.type : ""}`}
            </div>
        </li>;
    }

    componentWillUnmount() {
        this.reactionDisposer();
    }
}
