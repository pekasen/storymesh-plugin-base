import { makeObservable } from "mobx";
import { IPlugInRegistryEntry } from '../../renderer/utils/PlugInClassRegistry';
import { Class } from '../../renderer/utils/registry';
import { AbstractStoryObject } from './AbstractStoryObject';

/**
 * 
 * @param target 
 * @param name 
 * @param id 
 * @param icon 
 */
export function exportClass(target: Class<AbstractStoryObject>, name: string, id: string, icon: string): IPlugInRegistryEntry<AbstractStoryObject> {
    return makeObservable({
        name: name,
        id: id,
        icon: icon,
        author: "NGWebS-Core",
        version: "1.0.0",
        class: target
    }, {})
}
