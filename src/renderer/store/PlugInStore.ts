import { readdirSync } from "fs";

export const  plugInLoader = () => { //Promise<IPlugInRegistryEntry<AbstractStoryObject>[]> 
    const regex = /\.js/gm;
    const localPath = __dirname + "/../../plugins/"; 
    const plugs = readdirSync(localPath).
        filter(e => regex.test(e))

    // const _res = await Promise.all(
    //     fs.readdirSync(localPath).
    //     filter(e => regex.test(e)).map(file => (
    //     import(localPath + file)
    // )));

    // return _res;

    return  plugs
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    .map(plug => require(localPath + plug).plugInExport)
};