import { observable, makeObservable, action } from "mobx";

interface ICoords {
    x: number
    y: number
}

export class MoveableItem { //<T extends IValue>

    // public data: T;
    id: string;
    public x: number;
    public y: number;
    public cachedCoords: ICoords
    
    constructor(id: string, x?: number, y?: number) {
        // this.data = data;
        this.id = id
        this.x = x || 0;
        this.y = y || 0;
        this.cachedCoords = {
            x: this.x,
            y: this.y
        };
    
        makeObservable(this, {
            // data: observable,
            x: observable,
            y: observable,
            updatePosition: action
        });
    }

    public updatePosition(x: number, y: number): void {
        this.x += x;
        this.y += y;
    }

    get cached(): ICoords {
        return this.cachedCoords
    }

    updateCached(x: number, y: number): void {
        this.cachedCoords = {x: x, y: y}
    }

    resetCache(): void {
        this.cachedCoords = { x: 0, y: 0};
    }
}
