import Two from 'twojs-ts';
import { Moveable } from './Moveable';
import { MoveableItem } from "../store/MoveableItem";
import { Component, createRef, h } from "preact";
import { IItem } from './IItem';

interface IEdge<T extends IItem> {
    a: MoveableItem
    b: MoveableItem    
    id: string;
    line: Two.Path
    onClick?: () => void
    onDrag?: () => void
    onDrop?: () => void
    onDblClick?: () => void
    children: h.JSX.Element
}

export class EdgeView extends Component<IEdge<IItem>> {
    a: MoveableItem;
    b: MoveableItem;
    line: Two.Path;
    id: string;

    constructor(props: IEdge<IItem>) {
        super(props);
        this.a = props.a;
        this.b = props.b;
        this.line = props.line;
        this.id = props.id;
    }

    render({ a, b, line }: IEdge<IItem>): h.JSX.Element { 
            return <div
                onMouseDown={ 
                    (e: h.JSX.TargetedMouseEvent<HTMLDivElement>) => {
                        e = e || window.event;
                        e.preventDefault();
    
                        const x = e.clientX;
                        const y = e.clientY;
                        const x_0 = a.x;
                        const y_0 = a.y;
    
                        function updater (this: Document, event: MouseEvent) {
                            const _event = event as h.JSX.TargetedMouseEvent<HTMLDocument>
                            // _event.prevententDefault();
    
                            const _x = _event.clientX;
                            const _y = _event.clientY;
                            const d_x = (_x - x);
                            const d_y = (_y - y);
                            a.updatePosition(
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
                </div>
    }
}