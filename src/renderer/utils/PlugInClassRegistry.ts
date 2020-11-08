import { action, makeObservable, observable } from 'mobx';
import { h } from 'preact';
import { Class, ClassRegistry, IRegistryEntry } from './registry';

/**
 * Creates a PlugIn-Registry
 */
export class PlugInClassRegistry<T extends IPlugIn> extends ClassRegistry<T> {
    
    public registry: Map<string, IPlugInRegistryEntry<T>>;

    constructor() {
        super();
        this.registry = new Map();
        // makeObservable(this, {
        //     register: action,
        //     registry: observable
        // })
    }
}

export interface IPlugInRegistryEntry<T> extends IRegistryEntry<T> {
    name: string;
    id: string;
    author: string;
    version: string;
    website?: string;
    description?: string;
    class: Class<T>;
}

export interface IPlugIn {
    readonly menuTemplate: IMenuTemplate[];
    render(): h.JSX.Element;
}

export type MenuItemSpecification = "radio" | "textarea" | "text" | "hslider" | "vslider" | "dropdown" | "check" | "url" | "color";

export interface IMenuTemplate {
    label: string;
    type: MenuItemSpecification;
    valueReference: (newValue: any) => void;
    value: (() => string);
}
