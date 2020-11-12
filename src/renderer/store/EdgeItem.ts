import { observable, makeObservable } from "mobx";
import Two from 'twojs-ts';
import { IItem } from '../components/IItem';
import { MoveableItem } from './MoveableItem';

export interface IEdge extends IItem {
    id: string;
    from: MoveableItem;
    to: MoveableItem;
    line: Two.Path;
}

export class EdgeItem implements IEdge {
    from: MoveableItem;
    to: MoveableItem;
    line: Two.Path;
    id: string;

    constructor(props: IEdge) {
        this.from = props.from;
        this.to = props.to;
        this.id = props.id; 
        this.line = props.line;

        makeObservable(this, {
            from: observable,
            to: observable
        });
    }
}
