import { Component, FunctionalComponent, h } from "preact";
import { reaction, IReactionDisposer } from "mobx";

import { IItem } from './IItem';
import { ISelectableProps } from '../store/SelectedItemStore';
import { INotifyable } from '../utils/registry';
import { MoveableItem } from '../store/MoveableItem';
import { useCallback, useContext, useEffect, useState } from 'preact/hooks';
import { Store } from "../index";

interface IMoveableProps extends ISelectableProps, INotifyable<MoveableItem>, IItem {
    children: preact.JSX.Element
}

export class MoveSender extends Component<IMoveableProps> {
    render ({ registry, id, children, selectedItems}: IMoveableProps): h.JSX.Element {
        const item = registry.getValue(id);
        if (!item) throw("Nono1")


        children.props["draggable"] = true;
        children.props["onDragStart"] = (e: DragEvent) => {
            e.preventDefault();
        }
        children.props["id"] = id;
        children.props["onMouseDown"] = (e: MouseEvent) => {
            e = e || window.event;

            // TODO: prevent dragging beyond 0, since, it would move items out of view
            function updater (this: Document, event: MouseEvent) {
                selectedItems.ids.forEach(itemID => {
                    const _item = registry.getValue(itemID)
                    if (_item) {
                        _item.updatePosition(
                            event.movementX,
                            event.movementY
                        );
                        console.log("Moving item:", _item)
                    }
                });
            }

            function remover () {
                document.removeEventListener("mousemove", updater)
                document.removeEventListener("mouseup", remover);
            }       
            document.addEventListener("mousemove", updater);
            document.addEventListener("mouseup", remover);
        }
        return children
    }
}

export const MoveReceiver: FunctionalComponent<IMoveableProps> = ({id, children}: IMoveableProps) => {

    const store = useContext(Store);
    const [_, setState] = useState({});
    const registry = store.uistate.moveableItems;
    const item = registry.getValue(id);
    if (!item) throw("MoveableItem not defined");

    useEffect(() => {
        const disposer = reaction(
            () => ({
                x: item.x,
                y: item.y,
            }),
            () => {
                setState({});
            }
        )

        return () => {
            disposer();
        }
    })

    return <div
        id={id}
        style={
            "position: absolute;" +
            (item.x === 0 ? "" : `left: ${item.x};`) +
            (item.y === 0 ? "" : `top: ${item.y};`)
        }
        >
            {children}
        </div>
}

export class MoveReceiver1 extends Component<IMoveableProps> {
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
            id={id}
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
 * 
 * @deprecated
 * @warning DO NOT USE!
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
            id={id}
            draggable={true}
            style={
                "position: absolute;" +
                (item.x === 0 ? "" : `left: ${item.x};`) +
                (item.y === 0 ? "" : `top: ${item.y};`)
            }
            onMouseDown={ 
                (e: MouseEvent) => {
                    e = e || window.event;

                    // TODO: prevent dragging beyond 0, since, it would move items out of view
                    function updater (this: Document, event: MouseEvent) {
                        const _event = event as h.JSX.TargetedMouseEvent<HTMLDocument>
                        // _event.prevententDefault();

                        selectedItems.ids.forEach(itemID => {
                            const _item = registry.getValue(itemID)
                            if (_item) {

                                _item.updatePosition(
                                    e.movementX,
                                    e.movementY
                                );
                            }
                        });
                    }

                    function remover (e: MouseEvent) {
                        e.preventDefault();
                        document.removeEventListener("mousemove", updater)
                        document.removeEventListener("mouseup", remover);
                    }
                    
                    document.addEventListener("mousemove", updater);
                    document.addEventListener("mouseup", remover);
                }
            }>
                {children}
            </div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
