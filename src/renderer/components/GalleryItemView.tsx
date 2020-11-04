import { IReactionDisposer, reaction } from 'mobx';
import { Component, FunctionComponent, h } from 'preact';

interface IItem {
    id: string
}

interface IGalleryItemViewProps<T extends IItem> {
    item: T
    onClick?: () => void
    onDblClick?: () => void
    children: h.JSX.Element
}

export class GalleryItemView extends Component<IGalleryItemViewProps<IItem>> {

    reactionDisposer: IReactionDisposer;

    constructor(props: IGalleryItemViewProps<IItem>) {
        super(props);

        this.reactionDisposer = reaction(
            () => ({ ...props.item }),
            () => {
                this.setState({});
            }
        );
    }
    
    render({ item, children, onClick }: IGalleryItemViewProps<IItem>): h.JSX.Element {
        // let activeClass = "list-group-item";

        return <li
            class="list-group-item gallery-item"
            onClick={() => {
                if (onClick) onClick();
                // activeClass = activeClass + " active";
                // TODO: add hover effect!
            }}
            // onDblClick={onDblClick}
            draggable={true}
            onDragStart={e => {
                if (e.target) {
                    e.dataTransfer?.setData("text", item.id);
                }
            }}>
            {children}
        </li>;
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}

/**
 * Create a draggable div!!21
 * 
 * @param {IItem} props Properties, must extend IItem interface
 * @returns {Element} Preact Element
 */
export const Draggable: FunctionComponent<IItem> = ({ children, id }) => (
    <div
        draggable={true}
        onDragStart={e => {
            if (e.target) {
                e.dataTransfer?.setData("text", id);
            }
        }}>
        {children}
    </div>
);
