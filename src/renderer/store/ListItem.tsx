import { action, makeObservable, observable } from "mobx";

export class ListItem {
    public name: string;
    public type?: string;

    constructor(name: string, type?: string) {
        this.name = name;
        if (type) {
            this.type = type;
        }

        makeObservable(this, {
            name: observable,
            type: observable,
            changeName: action
        });
    }

    changeName(name: string) {
        this.name = name;
    }
}
