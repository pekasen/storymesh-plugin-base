import { FunctionComponent, h } from 'preact';
import { IItem } from './IItem';

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
