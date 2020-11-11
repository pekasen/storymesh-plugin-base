import * as fs from "fs";
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';
import { IPlugIn, IPlugInRegistryEntry } from '../utils/PlugInClassRegistry';

export const  PlugInsStore = () : IPlugInRegistryEntry<IStoryObject & IPlugIn>[] => {
    const regex = /\.js/gm;
    const localPath = __dirname + "/../../plugins/";
    const plugs = fs.readdirSync(localPath)
    .filter(e => regex.test(e));
    
    console.log(plugs);
    
    return  plugs
    .map(plug => require(localPath + plug))
};