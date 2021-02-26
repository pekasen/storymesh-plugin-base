import Logger from 'js-logger';
import { FunctionComponent, h } from 'preact';
import { IItem } from './IItem';

/**
 * Create a draggable div!!21
 *
 * @param {IItem} props Properties, must extend IItem interface
 * @returns {Element} Preact Element
 */
export const Draggable: FunctionComponent<IItem> = ({ children, id }) => {
    const _children = children as h.JSX.Element;
    _children.props['draggable'] = true;
    _children.props['onDragStart'] = (e: DragEvent) => {
        if (e.target) {
            e.dataTransfer?.setData("text", id);
            e.dataTransfer?.setDragImage(new Image(0, 0), 0 ,0);
            Logger.info("dragging from", id);
        }
    }

    return _children
}
