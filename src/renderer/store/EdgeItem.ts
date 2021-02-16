import { observable, makeObservable } from "mobx";
import Two from 'twojs-ts';
import { IItem } from '../components/IItem';
import { MoveableItem } from './MoveableItem';

export interface IEdgeProps extends IItem {
    id: string;
    from: MoveableItem;
    to: MoveableItem;
    line?: Two.Path;
}

export class EdgeItem implements IEdgeProps {
    id: string;
    from: MoveableItem;
    to: MoveableItem;
    line?: Two.Path;    

    constructor(props: IEdgeProps) {
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
