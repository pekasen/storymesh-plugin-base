import Two from 'twojs-ts';
import { Moveable } from './Moveable';
import { MoveableItem } from "../store/MoveableItem";
import { Component, createRef, h } from "preact";
import { IItem } from './IItem';

interface IEdge<T extends IItem> {
    a: MoveableItem<IItem>
    b: MoveableItem<IItem>
    line: Two.Path
    onClick?: () => void
    onDrag?: () => void
    onDrop?: () => void
    onDblClick?: () => void
    children: h.JSX.Element
}

export class EdgeView extends Component<IEdge<IItem>> {
    a: MoveableItem<IItem>;
    b: MoveableItem<IItem>;
    line: Two.Path;

    constructor(props: IEdge<IItem>) {
        super(props);
        this.a = props.a;
        this.b = props.b;
        this.line = props.line;
    }

    render({ a, b, line }: IEdge<IItem>): undefined {
        return;
    }
}