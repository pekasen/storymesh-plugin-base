
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

export interface IRegistryEntry<T> {
    // Index signature to limit possible keys as string and property values to either string, template type or undefined.
    // [key: string]: string | T | Class<T> | undefined
    name: string
    class: Class<T>
}

/**
 * Creates a registry object of a superclass which inherits to classes to be stored in this registry
 * 
 * @template T
 */
export class Registry<T> {
    // extends Singleton<Registry<T>>

    public registry: IRegistryEntry<T>[]

    public constructor () {
        this.registry = [];
    }

    /**
     * registers a subclass of T to the registry
     * 
     * @template T
     * @param {IRegistryEntry<T>[]} entries entries to register
     */
    public register(entries: IRegistryEntry<T>[]): void {
        this.registry.push(...entries);
    }
}

    /**
 * registers class constructors inheriting from a common superclass and exposes their contructors
 */
export class ClassRegistry<T> extends Registry<T> {

    /**
     * returns a new instance of the requested registered class
     * 
     * @template T
     * @param {string} of name of the class to get a new instance of
     * @returns {T} returns a new instance of type T
     */
    public getNewInstance(of: string): T {
        return new (this.registry.filter(it => it.name === of)[0].class)();
    }
}

export interface IValue<T> {
    value: T
    id: string
}

export class ValueRegistry<T> {
    
    public registry: IValue<T>[]

    
    constructor () {
        this.registry = [];
    }

    public registerValue(value: IValue<T>): boolean {
        if (this.findValuesByID(value.id).length === 0) {
            this.registry.push(value)

            return true
        }
        else return false
    }

    public deregisterValue(id: string): void {
        const value = this.findValuesByID(id)[0];
        const index = this.valuesIndices(value);

        this.registry.splice(index, 1)
    
    }

    public getRegisteredValue(id: string): T  | undefined{
        const values = this.registry.filter((value) => value.id === id);
        if (values.length !== 0) return values[0].value 
        else return undefined
    }

    public overwriteValue(value: IValue<T>): void {
        this.registry.splice(
            this.valuesIndices(value),
            1,
            value
        );
    }

    private findValuesByID(id: string) {
        return this.registry.filter(v => (v.id === id));
    }

    private valuesIndices(value: IValue<T>): number {
        return this.registry.indexOf(value);
    }
}