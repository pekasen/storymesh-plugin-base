import { makeAutoObservable } from "mobx";
import { createModelSchema, object, primitive, setDefaultModelSchema } from 'serializr';
import { PaneProperties } from './PaneProperties';

export interface IWindowProperties {
    width: number;
    height: number;
    sidebarPane: PaneProperties
    previewPane: PaneProperties
    title: string;
}

export class WindowProperties implements IWindowProperties {
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
}

export const WindowPropertiesSchema = createModelSchema(WindowProperties, {
    width: primitive(),
    height: primitive(),
    title: primitive(),
    sidebarPane: object(PaneProperties),
    previewPane: object(PaneProperties)
});

setDefaultModelSchema(WindowProperties, WindowPropertiesSchema);
