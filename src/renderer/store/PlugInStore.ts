import { readdirSync } from "fs";
import { IPlugInRegistryEntry } from "../utils/PlugInClassRegistry";

export const plugInLoader = () => { //Promise<IplugInRegistryEntry<AbstractStoryObject>[]> 
    const regex = /\.js/gm;
    const localPath = __dirname + "/../../plugIns/"; 
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

export const plugInLoader2 = (url: string) => { //Promise<IplugInRegistryEntry<AbstractStoryObject>[]> 
    const regex = /\.js/gm;
    const localPath = __dirname + `/../../${url}/`; 
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

export type IPlugInRegistryEntryCategory = "object" | "modifier" | "pane";

export class PlugInRegistryEntry<T> {
    public name: string;
    public id: string;
    public category: string;
    public _constructor: T
    public public: boolean;

    constructor(name: string, id: string, category: string, constructor: T, _public?: boolean) {
        this.name = name;
        this.id = id;
        this.category = category;
        this.public = _public || true;
        this._constructor = constructor;
    }
}

type RecursiveMap<T> = Map<string, RecursiveMap<T> | T>;

export class PlugInStore<T> {
    private entries: RecursiveMap<IPlugInRegistryEntry<T>> // Map<string, Map<string, Map<string, IIPlugInRegistryEntry>>>;

    constructor() {
        this.entries = new Map([
            ["internal", new Map([
                ["modifier", new Map()],
                ["content", new Map()],
                ["pane", new Map()],
            ])],
            ["external", new Map([
                ["modifier", new Map()],
                ["content", new Map()],
                ["pane", new Map()],                
            ])],
        ]);
    }

    public getNewInstance(id: string): T | undefined {
        const path = id.split(".");
        const obj = path.reduce((p: RecursiveMap<IPlugInRegistryEntry<T>> | IPlugInRegistryEntry<T> | undefined, v: string) => {
            if (p instanceof Map) {
                const value = p.get(v);
                // console.log("Getting", v, value);
                return value;
                
                // if (value instanceof Map || value instanceof IPlugInRegistryEntry) {
                //     return value
                // } else return;
            }
        }, this.entries);

        if (obj) return new (obj as IPlugInRegistryEntry<T>).class(); // && obj instanceof IPlugInRegistryEntry
    }

    public setPlugIn(id: string, IPlugInRegistryEntry: IPlugInRegistryEntry<T>): void {
        const path = id.split(".");

        path.reduce((
                p: RecursiveMap<IPlugInRegistryEntry<T>> | IPlugInRegistryEntry<T> | undefined,
                v: string,
                ci: number
        ) => {
            if (p instanceof Map) {
                const value = p.get(v);
                if (value === undefined) {
                    if (ci === 2) {
                        p.set(v, IPlugInRegistryEntry)
                    } else {
                        p.set(v, new Map())
                    }
                } else if (value instanceof Map) {
                    return value
                }
                return p;
            }
            else return;
        }, this.entries);
    }

    public get registry(): IPlugInRegistryEntry<T>[] {
        // this accessor should return a array/Map of all entries
        const recurseMap = (map: RecursiveMap<IPlugInRegistryEntry<T>>): IPlugInRegistryEntry<T>[] => {
            const entries = Array.from(map).map(e => e[1]);
            const ret = entries.map(entry => {
                if (entry instanceof Map) {
                    return recurseMap(entry)
                } else return entry
            });
            return ret.reduce((arr: IPlugInRegistryEntry<T>[], ent: IPlugInRegistryEntry<T>[] | IPlugInRegistryEntry<T>) => {
                if (Array.isArray(ent)) {
                    ent.forEach(e => arr.push(e))
                } else {
                    arr.push(ent)
                }
                return arr;
            }, []);
        }

        return recurseMap(this.entries);
    }
}
