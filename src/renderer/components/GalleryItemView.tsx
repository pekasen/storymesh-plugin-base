import { IReactionDisposer, reaction } from 'mobx';
import { Component, FunctionalComponent, h } from 'preact';
import { IStoryObject } from 'storygraph';
import { AbstractStoryObject } from '../../plugins/helpers/AbstractStoryObject';
import { IPlugIn, IPlugInRegistryEntry } from '../utils/PlugInClassRegistry';
import { Draggable } from './Draggable';
import { IItem } from './IItem';

interface IGalleryItemViewProps<T extends IItem> {
    item: T
    onClick?: () => void
    onDblClick?: () => void
    children: h.JSX.Element
}

export class GalleryItemView extends Component<IGalleryItemViewProps<IPlugInRegistryEntry<IStoryObject & IPlugIn>>> {

    reactionDisposer: IReactionDisposer;

    constructor(props: IGalleryItemViewProps<IPlugInRegistryEntry<IStoryObject & IPlugIn>>) {
        super(props);

        this.reactionDisposer = reaction(
            () => ({ ...props.item }),
            () => {
                this.setState({});
            }
        );
    }
    
    render({ item, children, onClick }: IGalleryItemViewProps<IPlugInRegistryEntry<IStoryObject & IPlugIn>>): h.JSX.Element {
        return <Draggable id={item.id}>
            <li class="gallery-item" onClick={onClick}>
                <span class={`icon ${item.icon}`}></span>
                {children}
            </li>
        </Draggable>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}

export const GalleryItemLiner: FunctionalComponent = () => (
    <li class="gallery-item-line "></li>
)
