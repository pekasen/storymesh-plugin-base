import { makeAutoObservable } from "mobx";
import { PaneProperties } from './PaneProperties';
import { IStoreableObject } from './StoreableObject';

export interface IWindowProperties {
    width: number;
    height: number;
    sidebarPane: PaneProperties
    previewPane: PaneProperties
    title: string;
}

export class WindowProperties implements IStoreableObject<IWindowProperties> {
    width: number;
    height: number;
    title: string;
    sidebarPane: PaneProperties
    previewPane: PaneProperties

    constructor() {
        this.width = 800;
        this.height = 600;
        this.title = "Untitled Document";
        this.sidebarPane = new PaneProperties();
        this.previewPane = new PaneProperties();
        makeAutoObservable(this);
    }

    setHeight(height: number): void {
        this.height = height;
    }

    setWidth(width: number): void {
        this.width = width;
    }

    setTitle(title?: string): void {
        this.title = title || "Untitled Document";
    }

    loadFromPersistance({ height, width, title }: IWindowProperties): void {
        this.height = height;
        this.width = width;
        this.title = title;
    }

    // TODO: implement
    writeToPersistance(): void {
        null
    }
}
