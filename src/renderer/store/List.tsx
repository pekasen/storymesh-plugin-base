import { makeAutoObservable } from "mobx";
import { ListItem } from "./ListItem";

export class List {
    public members: ListItem[];

    constructor(members?: ListItem[]) {
        this.members = members || [];
        makeAutoObservable(this);
    }

    addMember(name: string, type: string) {
        this.members = [...this.members, new ListItem(name, type)];
    }
}
