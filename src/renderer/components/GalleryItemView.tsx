import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { Draggable } from './Draggable';
import { IItem } from './IItem';

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
        return <Draggable id={item.id}>
            <li class="gallery-item list-group-item" onClick={onClick}>{children}</li>
        </Draggable>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
