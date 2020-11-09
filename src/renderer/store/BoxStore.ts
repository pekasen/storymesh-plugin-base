import { observable, makeObservable } from "mobx";
import { ListItem } from './ListItem';
import { MoveableItem } from '../store/MoveableItem';

export class BoxStore extends MoveableItem {

    public width: number;
    public height: number;

    constructor(data: ListItem, x: number, y: number, width: number, height: number) {
        super(data, x, y);
        this.width = width;
        this.height = height;

        makeObservable(this, {
            width: observable,
            height: observable
        });
    }
}
