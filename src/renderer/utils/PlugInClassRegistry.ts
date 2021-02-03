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
    icon: string;
    website?: string;
    description?: string;
    public?: boolean;
    category?: string;
    class: Class<T>;
}

export interface INGWebSProps {
    id: string
    registry: ValueRegistry<IStoryObject>
    renderingProperties?: IRenderingProperties
    userDefinedProperties?: any;
    content?: IContent
    modifiers?: IStoryModifier[]
    graph?: StoryGraph
}

export interface IPlugIn {
    menuTemplate: IMenuTemplate[];
    getComponent?(): FunctionalComponent<INGWebSProps>;
}

export type MenuItemSpecification = "table" |
    "radio" |
    "button" |
    "buttongroup" |
    "divider" |
    "textarea" |
    "text" |
    "hslider" |
    "vslider" |
    "dropdown" |
    "check" |
    "file-selector" |
    "url" |
    "color" |
    "connectiontable" |
    "display";

export interface IMenuTemplate<Value = any, Options = any> {
    label: string;
    type: MenuItemSpecification;
    valueReference: (arg: Value) => void;
    value: (() => Value);
    // TODO: make it type-safe!!!
    options?: Options;
}

export interface IMenuTemplate2<U, V> extends IMenuTemplate{
    valueReference: (...args: any[]) => U;
    value: () => V
}