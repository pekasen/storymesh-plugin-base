import { makeAutoObservable } from "mobx";
import { ListItem, IListItemProperties } from "./ListItem";
import { IStoreableObject } from './StoreableObject';

export interface IListProperties {
    members: IListItemProperties[]
}

export class List implements IStoreableObject<IListProperties> {
    public members: ListItem[];

    constructor(members?: ListItem[]) {
        this.members = members || [];
        makeAutoObservable(this);
    }

    addMember(name: string, type?: string) {
        this.members = [...this.members, new ListItem(name, type)];
    }

    clear() {
        this.members = [];
    }

    loadFromPersistance(from: IListProperties) {
        this.members = from.members.map(e => new ListItem(e.name, e.type, e.id))
    }
    
    itemByID (id: string): ListItem | undefined {
        console.log(this.members.filter((item) => (item.id === id)), this.members);
        return this.members.filter((item) => (item.id === id))[0]
    }
}
