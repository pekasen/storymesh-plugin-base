import { Component, h } from "preact";
import { reaction, IReactionDisposer } from "mobx";

import { IItem } from './IItem';
import { ISelectableProps } from '../store/SelectedItemStore';
import { INotifyable } from '../utils/registry';
import { MoveableItem } from '../store/MoveableItem';

interface IMoveableProps extends ISelectableProps, INotifyable<MoveableItem>, IItem {
    children: preact.JSX.Element
}

export class MoveSender extends Component<IMoveableProps> {
    render ({ registry, id, children, selectedItems}: IMoveableProps): h.JSX.Element {
        const item = registry.getValue(id);
        if (!item) throw("Nono1")
        children.props["draggable"] = true;
        children.props["onDragStart"] = (e: DragEvent) => {
            e = e || window.event;

            e.dataTransfer?.setDragImage(new Image(0, 0), 0, 0);
            e.dataTransfer?.setData("text", selectedItems.ids.join())

            // click position
            const x_0 = e.clientX;
            const y_0 = e.clientY;

            selectedItems.ids.forEach(itemID => {
                const _item = registry.getValue(itemID)
                if (_item) _item.resetCache();
            });

            // TODO: prevent dragging beyond 0, since, it would move items out of view
            function updater (this: Document, event: MouseEvent) {
                const _event = event as h.JSX.TargetedMouseEvent<HTMLDocument>

                // updated mouse position while mouse down
                const _x = _event.clientX;
                const _y = _event.clientY;

                // change on mouse event while mouse down
                const d_x = (_x - x_0);
                const d_y = (_y - y_0);
                console.log(d_x, d_y);
                selectedItems.ids.forEach(itemID => {
                    const _item = registry.getValue(itemID)
                    if (_item) {
                        const cached = _item.cached
                        _item.updatePosition(
                            d_x - cached.x,
                            d_y - cached.y
                        );
                        _item.updateCached(d_x, d_y);
                    }
                });
            }

            function remover () {
                document.removeEventListener("drag", updater)
                document.removeEventListener("dragend", remover);
            }       
            document.addEventListener("drag", updater);
            document.addEventListener("dragend", remover);
        }
        return children
    }
}

export class MoveReceiver extends Component<IMoveableProps> {
    private reactionDisposer: IReactionDisposer

    constructor(props: IMoveableProps) {
        super(props);

        const item = props.registry.getValue(props.id)
        if (!item) throw("Nono1")

        this.reactionDisposer = reaction(
            () => ({
                x: item.x,
                y: item.y,
            }),
            () => {
                this.setState({});
            }
        )
    }

    render ({ registry, id, children }: IMoveableProps): h.JSX.Element {
        const item = registry.getValue(id);

        if (!item) throw("Nono1")
        
        return <div
            style={
                "position: absolute;" +
                (item.x === 0 ? "" : `left: ${item.x};`) +
                (item.y === 0 ? "" : `top: ${item.y};`)
            }
            >
                {children}
            </div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}

/**
 * Creates a moveable div and bind its data to a mobx store
 */
export class Moveable extends Component<IMoveableProps> {
    reactionDisposer: IReactionDisposer

    constructor(props: IMoveableProps) {
        super(props);

        const item = props.registry.getValue(props.id)
        if (!item) throw("Nono1")

        this.reactionDisposer = reaction(
            () => ({
                x: item.x,
                y: item.y,
            }),
            () => {
                this.setState({});
            }
        )
    }

    render ({ registry, id, children, selectedItems}: IMoveableProps): h.JSX.Element {
        const item = registry.getValue(id);

        if (!item) throw("Nono1")
        
        return <div
            draggable={true}
            style={
                "position: absolute;" +
                (item.x === 0 ? "" : `left: ${item.x};`) +
                (item.y === 0 ? "" : `top: ${item.y};`)
            }
            onDragStart={ 
                (e: DragEvent) => {
                    e = e || window.event;
                    // e.preventDefault();
                    e.dataTransfer?.setDragImage(new Image(0, 0), 0, 0);
                    e.dataTransfer?.setData("text", selectedItems.ids.join())

                    // click position
                    const x_0 = e.clientX;
                    const y_0 = e.clientY;

                    selectedItems.ids.forEach(itemID => {
                        const _item = registry.getValue(itemID)
                        if (_item) _item.resetCache();
                    });

                    // TODO: prevent dragging beyond 0, since, it would move items out of view
                    function updater (this: Document, event: MouseEvent) {
                        const _event = event as h.JSX.TargetedMouseEvent<HTMLDocument>
                        // _event.prevententDefault();

                        // updated mouse position while mouse down
                        const _x = _event.clientX;
                        const _y = _event.clientY;

                        // change on mouse event while mouse down
                        const d_x = (_x - x_0);
                        const d_y = (_y - y_0);

                        selectedItems.ids.forEach(itemID => {
                            const _item = registry.getValue(itemID)
                            if (_item) {
                                const cached = _item.cached
                                _item.updatePosition(
                                    d_x - cached.x,
                                    d_y - cached.y
                                );
                                _item.updateCached(d_x, d_y);
                            }
                        });
                    }

                    function remover (e: DragEvent) {
                        e.preventDefault();
                        document.removeEventListener("drag", updater)
                        document.removeEventListener("dragend", remover);
                    }
                    
                    document.addEventListener("drag", updater);
                    document.addEventListener("dragend", remover);
                }
            }>
                {children}
            </div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
