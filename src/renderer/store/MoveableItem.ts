import { observable, makeObservable, action } from "mobx";
import { ListItem } from './ListItem';

export class MoveableItem {

    public data: ListItem;
    public x: number;
    public y: number;

    constructor(data: ListItem, x: number, y: number) {
        this.data = data;
        this.x = x;
        this.y = y;

        makeObservable(this, {
            data: observable,
            x: observable,
            y: observable,
            updatePosition: action
        });
    }

    updatePosition(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }
}
