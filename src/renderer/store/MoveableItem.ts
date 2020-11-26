import { observable, makeObservable, action } from "mobx";

export class MoveableItem { //<T extends IValue>

    // public data: T;
    id: string;
    public x: number;
    public y: number;
    public width: number;
    public height: number;
    
    constructor(id: string, x?: number, y?: number, width?: number, height?: number) {
        // this.data = data;
        this.id = id
        this.x = x || 0;
        this.y = y || 0;
        this.width = width || 0;
        this.height = height || 0;

        makeObservable(this, {
            // data: observable,
            x: observable,
            y: observable,
            width: observable,
            height: observable,
            updatePosition: action
        });
    }

    public updatePosition(x: number, y: number): void {
        this.x += x;
        this.y += y;
    }

    public resize(width: number, height: number): void {
        this.width = width;
        this.height = height;
    }
}
