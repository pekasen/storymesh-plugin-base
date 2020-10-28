import { makeAutoObservable, values } from "mobx";
import { MoveableItem } from "./MoveableItem";
import { ListItem } from "./ListItem";
import { IStoreableObject } from './StoreableObject';
import { WindowProperties } from './WindowProperties';
import { rootStore } from '..';

interface IUIStoreProperties {
    windowProperties: WindowProperties
    searchResults: ListItem[]
    moveableItems: MoveableItem[]
    term: string
    file: string
}

export class UIStore implements IStoreableObject<IUIStoreProperties> {
    windowProperties: WindowProperties
    searchResults: ListItem[]
    moveableItems: MoveableItem[]
    term: string
    file: string
    leftSidebar: boolean

    constructor() {
        this.searchResults = [];
        this.moveableItems = [];
        this.term = "";
        this.file = "";
        this.leftSidebar = false;
        this.windowProperties = new WindowProperties();
        makeAutoObservable(this);
    }

    setSearchResults(items: ListItem[]) {
        console.log(items);
        this.searchResults = items;
    }

    setFile(file: string) {
        this.file = file;
    }

    clearSearchResults() {
        console.log("Do you crap yourself?");
        this.searchResults = [];
    }

    appendMoveableItem(item: MoveableItem) {
        this.moveableItems = [...this.moveableItems, item];
    }

    clearMoveableItems(butKeep?: MoveableItem) {
        if (butKeep) {
            const keep = this.moveableItems.filter((item) => (item === butKeep));
            this.moveableItems = keep;
        } else {
            this.moveableItems = [];
        }
    }

    setSearchTerm(term: string) {
        this.term = term;
    }

    loadFromPersistance(from: IUIStoreProperties) {
        this.file = from.file;
        this.term = from.term;
        this.windowProperties.loadFromPersistance(from.windowProperties);
        this.moveableItems = from.moveableItems
        .map(e => {
            const data = rootStore.model.itemByID(e.data.id);
            if (data !== undefined) return new MoveableItem(data, e.x, e.y)
        })
        .filter(e => e !== undefined) as MoveableItem[];
        this.searchResults = from.searchResults.map(e => new ListItem(e.name, e.type));
    }

    toggleSidebar() {
        this.leftSidebar = !this.leftSidebar;
    }

    get untitledDocument () {
        return this.file === "";
    }
}
