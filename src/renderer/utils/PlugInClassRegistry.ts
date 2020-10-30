import { h } from 'preact';
import { ClassRegistry, IRegistryEntry } from './registry';

/**
 * Creates a PlugIn-Registry
 */
export class PlugInClassRegistry<T extends IPlugIn> extends ClassRegistry<T> {
    
    public registry: IPlugInRegistryEntry<T>[];

    constructor() {
        super();
        this.registry = [];
    }
}

interface IPlugInRegistryEntry<T> extends IRegistryEntry<T> {
    name: string;
    author: string;
    version: string;
    website?: string;
    description?: string;
    constructor: T;
}

interface IPlugIn {
    getMenuTemplate(): IMenuTemplate[];
    render(): h.JSX.Element;
}

type MenuItemSpecification = "radio" | "text" | "hslider" | "vslider" | "dropdown" | "check" | "url" | "color";

interface IMenuTemplate {
    label: string;
    type: MenuItemSpecification;
    valueReference: unknown;
    valueTemplate: unknown;
}
