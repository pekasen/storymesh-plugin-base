import { h } from "preact";
import StoryGraph from 'storygraph';
import {IPlugInRegistryEntry, IPlugIn, IMenuTemplate } from "../renderer/utils/PlugInClassRegistry";

/**
 * Our first little dummy PlugIn
 * 
 * @todo It should actually inherit from StoryObject and not StoryGraph...
 */
class _TextObject extends StoryGraph implements IPlugIn{
    
    constructor() {
        super();
    }

    public getMenuTemplate(): IMenuTemplate[]  {

       
        return [
            {
                label: "Text",
                type: "text",
                valueReference: this.edges,
                valueTemplate: ""
            }
        ]
    }

    public render(): h.JSX.Element {
        return <div>Hello</div>
    }
}

export const TextObject: IPlugInRegistryEntry<StoryGraph> = {
    name: "TextObject",
    id: "internal.content.text",
    author: "NGWebS-Core",
    version: "1.0.0",
    class: _TextObject
}
