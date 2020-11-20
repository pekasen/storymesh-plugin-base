import { FunctionalComponent } from 'preact';
import { IStoryObject, StoryGraph } from 'storygraph';
import { IContent } from 'storygraph/dist/StoryGraph/IContent';
import { IRenderingProperties } from 'storygraph/dist/StoryGraph/IRenderingProperties';
import { IStoryModifier } from 'storygraph/dist/StoryGraph/IStoryModifier';
import { Class, ClassRegistry, IRegistryEntry, ValueRegistry } from './registry';

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

export interface INGWebSProps {
    id: string
    registry: ValueRegistry<IStoryObject>
    renderingProperties?: IRenderingProperties
    content?: IContent
    modifiers?: IStoryModifier[]
    graph?: StoryGraph
}

export interface IPlugIn {
    menuTemplate: IMenuTemplate[];
    getComponent(): FunctionalComponent<INGWebSProps>;
}

export type MenuItemSpecification = "table" |
    "radio" |
    "textarea" |
    "text" |
    "hslider" |
    "vslider" |
    "dropdown" |
    "check" |
    "url" |
    "color";

export interface IMenuTemplate {
    label: string;
    type: MenuItemSpecification;
    valueReference: (...args: any[]) => void;
    value: (() => any);
    options?: string[];
}
