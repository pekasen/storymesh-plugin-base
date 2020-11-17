import { makeAutoObservable } from 'mobx';

export class PaneProperties implements IPaneProperties {

    width: number;
    hidden: boolean;

    constructor(width?: number, hidden?: boolean) {
        this.width = width || 150;
        this.hidden = hidden || false;
        makeAutoObservable(this);
    }

    setWidth(width: number): void {
        this.width = width;
    }

    toggleHidden(): void {
        this.hidden = !this.hidden;
    }
}

export interface IPaneProperties {
    width: number;
    hidden: boolean;
}
