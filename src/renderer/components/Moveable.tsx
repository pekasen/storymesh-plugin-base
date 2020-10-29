import { Component, h } from "preact";
import { reaction, IReactionDisposer } from "mobx";

import { MoveableItem } from '../store/MoveableItem';

interface IMoveableProps {
    item: MoveableItem
    children: preact.JSX.Element
}

export class Moveable extends Component<IMoveableProps> {
    reactionDisposer: IReactionDisposer

    constructor(props: IMoveableProps) {
        super(props);

        this.reactionDisposer = reaction(
            () => ({x: props.item.x, y: props.item.y, name: props.item.data.name }),
            () => {
                this.setState({});
            }
        )
    }

    render ({ item, children}: IMoveableProps): h.JSX.Element { 
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
                }>{children}</div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}
