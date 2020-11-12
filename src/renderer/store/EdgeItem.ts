import { observable, makeObservable } from "mobx";
import { IItem } from '../components/IItem';
import { MoveableItem } from './MoveableItem';

export interface IEdge extends IItem {
    id: string;
    from: MoveableItem<IItem>;
    to: MoveableItem<IItem>;
}

export class EdgeItem implements IEdge {
    from: MoveableItem<IItem>;
    to: MoveableItem<IItem>;
    id: string;

    constructor(props: IEdge) {
        this.from = props.from;
        this.to = props.to;
        this.id = props.id; 

        makeObservable(this, {
            from: observable,
            to: observable
        });
    }
}
