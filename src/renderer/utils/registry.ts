// class Singleton<T> {
//     private static instance: T

//     public static getInstance(): T {
//         if(!Singleton.instance) {
//             Singleton.instance = new this();
//         }

//         return Singleton.instance
//     }

// }


// Crazy stuff, sauce here: https://2ality.com/2020/04/classes-as-values-typescript.html
interface Class<T> {
    new(...args: unknown[]): T
}

interface IObjectRegistryEntries<T> {
    name: string
    class: Class<T>
}

/**
 * Creates a registry object
 * 
 * @template {T} T  Superclass which inherits to classes to be stored in this registry
 */
export class Registry<T> {
    // extends Singleton<Registry<T>>

    private registry: IObjectRegistryEntries<T>[]

    public constructor () {
        // super();
        this.registry = [];
    }

    /**
     * 
     * @param entries {IObjectRegistryEntries<T>[]}     entries to register
     */
    public register(entries: IObjectRegistryEntries<T>[]): void {
        this.registry.push(...entries);
    }

    /**
     * 
     * @param of {string}   name of the class to get a new instance of
     * @returns {T}
     */
    public getNewInstance(of: string): T {
        return new (this.registry.filter(it => it.name === of)[0].class)();
    }
}