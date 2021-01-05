import { action, runInAction } from 'mobx';
import { NotificationStore } from './Notification';
import { SelectedItemStore } from "./SelectedItemStore";

interface ObjectAddChange {
    name: string
    newValue: unknown
}

interface ObjectUpdateChange {
    name: string
    oldValue: unknown
    newValue: unknown
}

interface ArraySpliceChange {
    index: number
    removedCount: number
    addedCount: number
    added: unknown[]
    removed: unknown[]
}

interface ArrayUpdateChange {
    index: number
    newValue: unknown
    oldValue: unknown
}

interface MapAddChange {
    name: string
    newValue: unknown
}

interface MapUpdateChange {
    name: string
    oldValue: unknown
    newValue: unknown
}

interface MapDeleteChange {
    name: string
    oldValue: unknown
}

type Accesor = "object" | "map" | "array" | "splice";

interface AccessorFunction {
    (object: unknown, changes: Change[]) : void
}

interface Change {
    key: string | number | symbol
    value: unknown
    action?: "remove" | "add"
}

interface DeltaObject {
    object: unknown
    changes: Change[]
    type: Accesor
}

export interface IDelta extends ArraySpliceChange,
                                ArrayUpdateChange,
                                ObjectAddChange,
                                ObjectUpdateChange,
                                MapAddChange,
                                MapDeleteChange,
                                MapUpdateChange 
{
    type: string;
    observableKind: string;
    object: unknown;
}

function pushLeft<T>(array: T[], item: T): T[] {
    array.splice(0, 0, item);
    return array;
}

export class StateProcotol {
    private _buffer: IDelta[][] = [];
    private _index = -1;
    private _busy = false;
    private _executing = false;
    private _timeout = 150; // time in ms, sets the time out to close an incoming batch
    private _scratch: IDelta[] = [];
    private _timer: NodeJS.Timeout = setTimeout(() => void 0, 0);

    public get busy(): boolean {
        return this._busy;
    }

    public set busy(value: boolean) {
        if (value === true && this._busy === false)
            this._getTimeOut();
        this._busy = value;
    }

    public persist(change: IDelta): void {

        if (!this._executing) {
            if (change.object instanceof SelectedItemStore || change.object instanceof Notification || change.object instanceof NotificationStore) {
                return;
            }
            if (!this.busy)
                this.busy = true;
            else {
                clearTimeout(this._timer);
                this._getTimeOut();
            }
            if (this._index !== -1) {
                // if we are persisting from a nonzero reading position, delete all righthand items and reset reading position
                this._buffer.splice(0, this._index);
                this._index = -1;
            }
            // this._scratch.push(change);
            pushLeft(this._scratch, change);
        }
    }

    public undo(): void {
        if (this._index < (this._buffer.length - 1)) {
            this._index += 1;
            this._execute("undo");
            console.log(this._index);
        }
    }

    public redo(): void {
        if (this._index > -1) {
            this._index -= 1;
            this._execute("redo");
            console.log(this._index);
        }
    }

    private _execute(direction: "undo" | "redo"): void {
        // guard against current change
        if (this._index === -1) return;
        // stop listening to changes from mobx
        this._executing = true;
        // define our sequence
        const reducer = (com: DeltaObject[], val: IDelta): DeltaObject[] => {
            let _c: DeltaObject;

            switch (val.observableKind) {
                case "object": {
                    _c = this._handleObjectChange(val, direction === "redo");
                    break;
                }
                case "array": {
                    _c = this._handleArrayChange(val, direction === "redo");
                    break;
                }
                case "map": {
                    _c = this._handleMapChange(val, direction === "redo");
                    break;
                }
                default: throw new Error("UndefError: observableKind cannot be undefined");
            }

            const index = com.findIndex((e) => (e.object === _c.object));
            if (index === -1) {
                // intitialize new object channel
                com.push(_c);
            } else {
                com[index].changes.push(..._c.changes);
            }
            return com;
        };

        // create the buffer
        let _changes: DeltaObject[];
        const _batch = this._buffer[this._index];
        // process each element into a array of Change
        if (direction === "undo") {
            _changes = _batch.reduce<DeltaObject[]>(reducer, []);            
        } else if (direction === "redo") {
            _changes = _batch.reduceRight<DeltaObject[]>(reducer, []);            
        } else {
            throw new Error("TypeError: direction is undefined"); 
        }
        // TODO: for each element calculate the final state
        
        console.log("reverting", _changes);
        const executer = () => {
            _changes.forEach(c => {
                if (c.type) {
                    const _fun = this.applyChanges.get(c.type);
                    if (_fun) _fun(c.object, c.changes);
                }
            });
        };
        runInAction(executer);

        // start listening again.
        this._executing = false;
    }

    private applyChanges = new Map<Accesor, AccessorFunction>([
        ["object", (object: unknown, changes: Change[]) => {
            {               
                if (object)
                    // runInAction(() => {
                        changes.forEach((change) => {
                            if (typeof change.key === "string") (object as Record<string, unknown>)[change.key] = change.value;
                            else throw new Error("TypeError: key is not string");
                        });
                    // });
            }
        }],
        // unnecessareey?
        ["array", (object: unknown, changes: Change[]) => {
            // runInAction(() => {
                changes.forEach((change) => {
                    (object as Array<unknown>)[change.key as number] = change.value;
                });
            // });
        }],
        ["splice", (object: unknown, changes: Change[]) => {
            if (Array.isArray(object)) {
                // runInAction(() => {
                    changes.forEach(change => {
                        if (change.action && typeof change.value === "number" && Array.isArray(change.value)) {
                            if (change.action === "add") {
                                object.splice(change.key as number, 0, ...change.value)
                            } else if (change.action === "remove") {
                                object.splice(change.key as number, change.value.length);
                            }
                        }
                    });
                // });
            }
        }],
        ["map", (object: unknown, changes: Change[]) => {            
            const map = (object as Map<string | number | symbol, unknown>);
            runInAction(() => {
                changes.forEach((change) => {
                    console.log("map",map, change.key, change.value);

                    if (change.value !== undefined) {
                        map.set(change.key, change.value);
                    } else {
                        map.delete(change.key);
                    }
                });
            });
        }],
    ])

    private _getTimeOut() {
        this._timer = setTimeout(() => {
            pushLeft(this._buffer, this._scratch);
            this._scratch = [];
            this.busy = false;
            console.log(this._buffer);
        }, this._timeout);
    }

    private _handleObjectChange(a: IDelta, redo = false): DeltaObject {
        return {
            object: a.object,
            changes: [
                {
                    key: a.name,
                    value: (redo) ? a.newValue : a.oldValue
                }
            ],
            type: "object"
        };
    }

    private _handleArrayChange(a: IDelta, redo = false): DeltaObject {
        if (a.type === "splice") {
            return {
                object: a.object,
                changes: [
                    {
                        key: a.name,
                        value: (redo) ? a.added : a.removed,
                        action: (a.removedCount >= 0) ? "remove" : "add"
                    }
                ],
                type: "splice"
            };
        } else {
            return {
                object: a.object,
                changes: [
                    {
                        key: a.name,
                        value: a.oldValue
                    }
                ],
                type: "array"
            };
        }
    }

    private _handleMapChange(a: IDelta, redo = false): DeltaObject {
        if (a.type === "add" && !redo) {
            return {
                object: a.object,
                changes: [
                    {
                        key: a.name,
                        value: undefined
                    }
                ],
                type: "map"
            }
        }
        if (a.type === "delete") {
            return {
                object: a.object,
                changes: [
                    {
                        key: a.name,
                        value: undefined
                    }
                ],
                type: "map"
            }
        } else {
            return {
                object: a.object,
                changes: [
                    {
                        key: a.name,
                        value: a.oldValue,
                        action: (a.removedCount >= 0) ? "remove" : "add"
                    }
                ],
                type: "map"
            }
        }
    }
}


