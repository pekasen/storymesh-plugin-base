import { makeObservable } from "mobx";
import { StoryObject } from "storygraph";
// import { IPlugInRegistryEntry } from '../../renderer/utils/PlugInClassRegistry';
import { Class, PlugIn } from 'storymesh-plugin-support';

/**
 * Pass the class and metadata to this function and assigned it to exported const plugInExprort in order to pump to the registry
 * 
 * @param target 
 * @param name 
 * @param id 
 * @param icon 
 * @param {boolean} isPublic Is this Plugin public?
 * @returns {PlugIn} PlugIn to register
 */
export function exportClass<Type>(
    target: Class<Type>,
    name: string,
    id: string,
    icon: string,
    isPublic?: boolean
): PlugIn {
    return makeObservable({
        name: name,
        id: id,
        icon: icon,
        public: isPublic ?? true,
        package: {
            name: "MSDFKM",
            version: "1.0.0",
            baseURL: "",
            publisher: {
                name: "NGWebS-Core",
                id: "a",
                mail: "av-lab@haw-hamburg"
            },
            __index: [
                ""
            ]
        },
        constructor: target
    });
}
