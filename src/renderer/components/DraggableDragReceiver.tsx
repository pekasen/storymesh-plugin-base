import { FunctionComponent, h } from 'preact';
import { IItem } from './IItem';

export interface IDragDropReceiver {
    onDrop: (e: DragEvent) => void
    onDragStart: (e: DragEvent) => void
}

export const DraggableDropReceiver: FunctionComponent<IItem & IDragDropReceiver> = ({ children, id, onDrop, onDragStart }) => {
    const _children = children as h.JSX.Element;
    _children.props['draggable'] = true;
    _children.props['onDragStart'] = (e: DragEvent) => {
        if (e.target) {
            e.stopPropagation();
            e.dataTransfer?.setData("text", id);
            e.dataTransfer?.setDragImage(new Image(0, 0), 0 ,0);
            console.log("dragging from", id);
            onDragStart(e);
        }
    };
    _children.props['onDragOver'] = (e: DragEvent) => {
        e.preventDefault();
    };
    _children.props['onDrop'] = onDrop;


    return _children
}
