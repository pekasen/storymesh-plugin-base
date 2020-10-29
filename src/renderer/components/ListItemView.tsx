import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { ListItem } from "../store/ListItem";

interface IListItemViewProps {
    item: ListItem;
    onClick?: () => void;
    onDblClick?: () => void;
}

export class ListItemView extends Component<IListItemViewProps> {

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
    
    render({ item, onClick }: IListItemViewProps): h.JSX.Element {
        let activeClass = "list-group-item";

        return <li
            class={activeClass}
            onClick={() => {
                if (onClick) onClick();
                activeClass = activeClass + " active";
            }}
            // onDblClick={onDblClick}
            draggable={true}
            onDragStart={e => {
                if (e.target) {
                    e.dataTransfer?.setData("text", item.id);
                }
            }}>
            <span class="icon icon-user img-circle media-object pull-left"></span>
            <div class="media-body">
                <strong>{`${item.name}`}</strong><br></br>
                {item.id}<br></br>
                {`${item.type ? item.type : ""}`}
            </div>
        </li>;
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
