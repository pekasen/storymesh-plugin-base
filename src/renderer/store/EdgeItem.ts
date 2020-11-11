import { observable, makeObservable } from "mobx";
import { MoveableItem } from './MoveableItem';

export class EdgeItem {

    a: MoveableItem;
    b: MoveableItem;

    constructor(a: MoveableItem, b: MoveableItem) {
        this.a = a;
        this.b = b;

        makeObservable(this, {
            a: observable,
            b: observable
        });
    }
}
