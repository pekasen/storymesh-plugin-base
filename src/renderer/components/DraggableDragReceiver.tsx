import { FunctionComponent, h } from 'preact';
import { IDragReceiver } from './DragReceiver';
import { IItem } from './IItem';


export const DraggableDropReceiver: FunctionComponent<IItem & IDragReceiver> = ({ children, id, onDrop }) => {
    const _children = children as h.JSX.Element;
    _children.props['draggable'] = true;
    _children.props['onDragStart'] = (e: DragEvent) => {
        if (e.target) {
            e.stopPropagation();
            e.dataTransfer?.setData("text", id);
            e.dataTransfer?.setDragImage(new Image(0, 0), 0 ,0);
            console.log("dragging from", id);
        }
    };
    _children.props['onDragOver'] = (e: DragEvent) => {
        e.preventDefault();
    };
    _children.props['onDrop'] = onDrop;


    return _children
}
