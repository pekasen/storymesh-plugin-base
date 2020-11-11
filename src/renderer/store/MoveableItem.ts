import { observable, makeObservable, action } from "mobx";
import { IValue } from '../utils/registry';


export class MoveableItem<T extends IValue> {

    public data: T;
    id: string;
    public x: number;
    public y: number;

    constructor(data: T, x: number, y: number) {
        this.data = data;
        this.id = data.id
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
