import { observable, makeObservable, action } from "mobx";

export class MoveableItem {

    public name: string;
    public x: number;
    public y: number;

    constructor(name: string, x: number, y: number) {
        this.name = name;
        this.x = x;
        this.y = y;

        makeObservable(this, {
            name: observable,
            x: observable,
            y: observable,
            updatePosition: action
        });
    }

    updatePosition(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    updateName(name: string) {
        this.name = name;
    }
}
