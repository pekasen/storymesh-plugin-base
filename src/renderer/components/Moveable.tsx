import { Component, h } from "preact";
import { reaction, IReactionDisposer } from "mobx";

import { IItem } from './IItem';

interface IDataItem extends IItem {
    // name: string
    id: string
}

interface IMoveableItem<T extends IDataItem> {
    // data: T
    x: number
    y: number
    updatePosition(x: number, y: number): void
}

interface IMoveableProps<T extends IDataItem> {
    item: IMoveableItem<T>
    children: preact.JSX.Element
}

/**
 * Creates a moveable div and bind its data to a mobx store
 */
export class Moveable<T extends IDataItem> extends Component<IMoveableProps<T>> {
    reactionDisposer: IReactionDisposer

    constructor(props: IMoveableProps<T>) {
        super(props);

        this.reactionDisposer = reaction(
            () => ({
                x: props.item.x,
                y: props.item.y,
                // name: props.item.data.name
            }),
            () => {
                this.setState({});
            }
        )
    }

    render ({ item, children}: IMoveableProps<T>): h.JSX.Element { 
        return <div
            style={
                "position: absolute;" +
                (item.x === 0 ? "" : `left: ${item.x};`) +
                (item.y === 0 ? "" : `top: ${item.y};`)
            }
            onMouseDown={ 
                (e: h.JSX.TargetedMouseEvent<HTMLDivElement>) => {
                    e = e || window.event;
                    e.preventDefault();

                    const x = e.clientX;
                    const y = e.clientY;
                    const x_0 = item.x;
                    const y_0 = item.y;

                    function updater (this: Document, event: MouseEvent) {
                        const _event = event as h.JSX.TargetedMouseEvent<HTMLDocument>
                        // _event.prevententDefault();

                        const _x = _event.clientX;
                        const _y = _event.clientY;
                        const d_x = (_x - x);
                        const d_y = (_y - y);
                        item.updatePosition(
                            d_x + x_0,
                            d_y + y_0
                        );
                    }

                    function remover () {
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
