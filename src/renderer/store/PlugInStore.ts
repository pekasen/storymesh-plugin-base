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

export const  plugInLoader2 = (url: string) => { //Promise<IPlugInRegistryEntry<AbstractStoryObject>[]> 
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

export type PlugInCategory = "object" | "modifier" | "pane";

export class PlugIn<T> {
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
    private entries: RecursiveMap<PlugIn<T>> // Map<string, Map<string, Map<string, IPlugIn>>>;

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
        const obj = path.reduce((p: RecursiveMap<PlugIn<T>> | PlugIn<T> | undefined, v: string) => {
            if (p instanceof Map) {
                const value = p.get(v);
                // console.log("Getting", v, value);
                return value;
                
                // if (value instanceof Map || value instanceof PlugIn) {
                //     return value
                // } else return;
            }
        }, this.entries);

        if (obj && obj instanceof PlugIn) return new obj._constructor();
    }

    public setPlugIn(id: string, plugin: PlugIn<T>): void {
        const path = id.split(".");

        path.reduce((
                p: RecursiveMap<PlugIn<T>> | PlugIn<T> | undefined,
                v: string,
                ci: number
        ) => {
            if (p instanceof Map) {
                const value = p.get(v);
                if (value === undefined) {
                    if (ci === 2) {
                        p.set(v, plugin)
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

    public get registry(): PlugIn<T>[] {
        // this accessor should return a array/Map of all entries
        const recurseMap = (map: RecursiveMap<PlugIn<T>>): PlugIn<T>[] => {
            const entries = Array.from(map).map(e => e[1]);
            const ret = entries.map(entry => {
                if (entry instanceof Map) {
                    return recurseMap(entry)
                } else return entry
            });
            return ret.reduce((arr: PlugIn<T>[], ent: PlugIn<T>[] | PlugIn<T>) => {
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
