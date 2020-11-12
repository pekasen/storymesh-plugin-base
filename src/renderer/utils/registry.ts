
// class Singleton<T> {
//     private static instance: T
//     public static getInstance(): T {
//         if(!Singleton.instance) {
//             Singleton.instance = new this();
//         }
//         return Singleton.instance
//     }
// }

import { action, makeObservable, observable } from 'mobx';


// Crazy stuff, sauce here: https://2ality.com/2020/04/classes-as-values-typescript.html
export interface Class<T> {
    new(...args: unknown[]): T
}

export interface IRegistryEntry<T> {
    // Index signature to limit possible keys as string and property values to either string, template type or undefined.
    [key: string]: string | T | Class<T> | undefined
    name: string
    id: string
    class: Class<T>
}

/**
 * Creates a registry object of a superclass which inherits to classes to be stored in this registry
 * 
 * @template T
 */
export class Registry<T> {

    public registry: Map<string, IRegistryEntry<T>>

    public constructor () {
        this.registry = new Map<string, IRegistryEntry<T>>()
    }

    /**
     * registers a subclass of T to the registry
     * 
     * @template T
     * @param {IRegistryEntry<T>[]} entries entries to register
     */
    public register(entries: IRegistryEntry<T>[]): void {
        entries.forEach(entry => {
            if (!this.registry.has(entry.id)) {
                this.registry.set(entry.id, entry);
            } else console.trace("cannot assign double entries");
        });
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
    public getNewInstance(of: string): T | undefined {
        if (this.registry.has(of)) {
            const entry = this.registry.get(of);

            if (entry !== undefined) {
                return new entry.class();
            }
        } else {
            throw("cannot create instance of " + of)
        }
    }
}

export interface INotifyable<T extends IValue> {
    registry: ValueRegistry<T>
}

/**
 * Creates a registery for a specific type which
 * can be retrieved by a string key
 * 
 * @tutorial 
 * ```
 const reg = new ValueRegistry<number>()
 reg.registerValue({
        id: "Bert",
        value: 42 
 });
 reg.getRegisteredValue("Bert") // 42
 * ```
 */
export class ValueRegistry<T extends IValue> {
    
    public registry: Map<string, T>
    
    constructor () {
        this.registry = new Map<string, T>();
        makeObservable(this, {
            registry: observable,
            register: action,
            deregister: action,
            overwrite: action,
            getValue: false
        });
    }

    public register(value: T): boolean {
        if (this.registry.get(value.id) === undefined) {
            this.registry.set(value.id, value);

            return true
        }
        else return false
    }

    public deregister(id: string): boolean {
        return this.registry.delete(id)
    }

    public getValue(forId: string): T | undefined{
        return this.registry.get(forId)
    }

    public overwrite(value: T): boolean {
        this.registry.set(value.id, value);

        return true
    }
}

export interface IValue {
    id: string
}
