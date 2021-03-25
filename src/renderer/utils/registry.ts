
// class Singleton<T> {
//     private static instance: T
//     public static getInstance(): T {
//         if(!Singleton.instance) {
//             Singleton.instance = new this();
//         }
//         return Singleton.instance
//     }
// }

import Logger from 'js-logger';
import { action, makeObservable, observable } from 'mobx';
import { createModelSchema, custom, getDefaultModelSchema, map, ModelSchema, object, serialize, deserialize, mapAsArray } from 'serializr';
import { IStoryObject } from 'storygraph';
import { rootStore } from '..';
import { StoryObject } from '../../plugins/helpers/AbstractStoryObject';
// import { deserializeObjectWithSchema } from '../../../node_modules/serializr/lib/core/deserialize';
import { IItem } from '../components/IItem';

// Crazy stuff, sauce here: https://2ality.com/2020/04/classes-as-values-typescript.html
export interface Class<T> {
    new(...args: unknown[]): T
}

export interface IRegistryEntry<T> extends IItem {
    // Index signature to limit possible keys as string and property values to either string, template type or undefined.
    [key: string]: string | boolean | T | Class<T> | undefined
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

export interface INotifyable<T extends IValue<T>> {
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
export class ValueRegistry<T extends IValue<T>> {
    
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
        // notify deregistring item to brace if it is interested
        const hangman = this.getValue(id);
        if (hangman && hangman.willDeregister){
            hangman.willDeregister(this);
        }

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

export interface IValue<T extends IValue<T>> {
    id: string
    willDeregister?(registry: ValueRegistry<T>): void
}
/**
 * 
 * @param target 
 */
export function AutoValueRegistrySchema<T extends IValue<T>> () : ModelSchema<ValueRegistry<IValue<T>>> {
    return createModelSchema(ValueRegistry, {
        registry: mapAsArray(custom(
        (v, k, obj) => {
            Logger.info("getting schema for", v.constructor.name);
            const _schema = getDefaultModelSchema(v.constructor);
            if (!_schema) throw("no schema available for "+ v.contructor.name);
            return serialize(_schema, v);
        },
        (jsonVal, context, callback) => {
            const instance = rootStore.root.pluginStore.getNewInstance(jsonVal.role);
            if (!instance) throw("Big time failure !!11 while fetching schema for" + jsonVal.role);
            Logger.info("getting schema for", instance.constructor.name);
            const _schema = getDefaultModelSchema(instance.constructor);
            if (!_schema) throw("no schema present during deserialization for " + context.target.constructor.name);
            return deserialize(_schema, jsonVal, callback);
            // return deserializeObjectWithSchema(context, _schema, jsonVal, callback, null);
        }), "id", {
            beforeDeserialize: (cb, value) => {
                if (Array.isArray(value)) {
                    value.sort((a: IStoryObject, b: IStoryObject) => {
                        const _aLength = a.childNetwork?.nodes.length
                        const _bLength = b.childNetwork?.nodes.length

                        return ((_aLength || 0) - (_bLength || 0)) || 0;
                    })
                }
                cb(null, value);
            },
            afterDeserialize: (cb, err, newValue, jsonValue, jsonParentVAlue, propNameorIndex, context, propDef) => {
                // This hook fires after the registry is loaded completly!
                const registry = newValue as Map<string, StoryObject>;
                registry.forEach(value => {
                    if (value.isContentNode && value.parent !== undefined) {
                        const parentGraph = registry.get(value.parent)?.childNetwork;
                        if (parentGraph?.notificationCenter) value.bindTo(parentGraph?.notificationCenter);
                    }
                })
                if (newValue instanceof StoryObject)
    
                // catches edges
                Logger.info("caught", newValue, context);
                cb(err, registry);
            }
        })
    });
}

export function ValueRegistrySchema<T extends IValue<T>> (target: ModelSchema<T>) : ModelSchema<ValueRegistry<IValue<T>>> {
    return createModelSchema(ValueRegistry, {
        registry: map(object(target))
    });
}
// setDefaultModelSchema(ValueRegistry, ValueRegistrySchema);
