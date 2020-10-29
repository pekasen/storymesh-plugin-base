import { action, makeObservable, observable } from "mobx";
import { v4 } from "uuid";

export interface IListItemProperties {
    name: string
    type?: string
    id: string
}

export class ListItem implements IListItemProperties {
    public id: string
    public name: string
    public type?: string

    constructor(name: string, type?: string, id?: string) {
        this.id = id || v4();
        this.name = name;
        if (type) {
            this.type = type;
        }

        makeObservable(this, {
            name: observable,
            type: observable,
            id: observable,
            changeName: action
        });
    }

    changeName(name: string): void {
        this.name = name;
    }
}
