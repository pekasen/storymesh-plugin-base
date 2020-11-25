import { makeObservable } from "mobx";
import { IPlugInRegistryEntry } from '../../renderer/utils/PlugInClassRegistry';
import { Class } from '../../renderer/utils/registry';
import { AbstractStoryObject } from './AbstractStoryObject';

/**
 * Pass the class and metadata to this function and assigned it to exported const plugInExprort in order to pump to the registry
 * 
 * @param target 
 * @param name 
 * @param id 
 * @param icon 
 * @param {boolean} isPublic Is this Plugin public?
 * @returns {IPlugInRegistryEntry<AbstractStoryObject>} PlugIn to register
 */
export function exportClass(
        target: Class<AbstractStoryObject>,
        name: string,
        id: string,
        icon: string,
        isPublic?: boolean
    ): IPlugInRegistryEntry<AbstractStoryObject> {
    return makeObservable({
        name: name,
        id: id,
        icon: icon,
        author: "NGWebS-Core",
        version: "1.0.0",
        public: (isPublic) ? isPublic : undefined,
        class: target
    }, {})
}
