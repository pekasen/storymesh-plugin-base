import { observable, makeObservable } from "mobx";
import { MoveableItem } from '../store/MoveableItem';
import { IItem } from '../components/IItem';

export class BoxStore extends MoveableItem<IItem> {

    public width: number;
    public height: number;

    constructor(data: IItem, x: number, y: number, width: number, height: number) {
        super(data, x, y);
        this.width = width;
        this.height = height;

        makeObservable(this, {
            width: observable,
            height: observable
        });
    }
}
