import { makeAutoObservable } from "mobx";
import { IStoreableObject } from './StoreableObject';


export interface IWindowProperties {
    width: number;
    height: number;
    title: string;
}

export class WindowProperties implements IStoreableObject<IWindowProperties> {
    width: number;
    height: number;
    title: string;

    constructor() {
        makeAutoObservable(this);
        this.width = 800;
        this.height = 600;
        this.title = "Untitled Document";
    }

    setHeight(height: number) {
        this.height = height;
    }

    setWidth(width: number) {
        this.width = width;
    }

    setTitle(title?: string) {
        this.title = title || "Untitled Document";
    }

    loadFromPersistance({ height, width, title }: IWindowProperties) {
        this.height = height;
        this.width = width;
        this.title = title;
    }
}
