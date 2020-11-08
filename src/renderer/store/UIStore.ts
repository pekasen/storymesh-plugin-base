import { makeAutoObservable } from "mobx";
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
    activeitem: string;

    constructor() {
        this.searchResults = [];
        this.moveableItems = [];
        this.term = "";
        this.file = "";
        this.leftSidebar = false;
        this.windowProperties = new WindowProperties();
        this.activeitem = "";
        makeAutoObservable(this);
    }

    setSearchResults(items: ListItem[]): void {
        console.log(items);
        this.searchResults = items;
    }

    setFile(file: string): void {
        this.file = file;
    }

    clearSearchResults(): void {
        console.log("Do you crap yourself?");
        this.searchResults = [];
    }

    appendMoveableItem(item: MoveableItem): void {
        this.moveableItems = [...this.moveableItems, item];
    }

    clearMoveableItems(butKeep?: MoveableItem): void {
        if (butKeep) {
            const keep = this.moveableItems.filter((item) => (item === butKeep));
            this.moveableItems = keep;
        } else {
            this.moveableItems = [];
        }
    }

    setSearchTerm(term: string): void {
        this.term = term;
    }

    loadFromPersistance(from: IUIStoreProperties): void {
        this.file = from.file;
        this.term = from.term;
        this.windowProperties.loadFromPersistance(from.windowProperties);
        // this.moveableItems = from.moveableItems
        // .map(e => {
        //     const data = rootStore.model.itemByID(e.data.id);
        //     if (data !== undefined) return new MoveableItem(data, e.x, e.y)
        // })
        // .filter(e => e !== undefined) as MoveableItem[];
        this.searchResults = from.searchResults.map(e => new ListItem(e.name, e.type));
    }

    // TODO: implement
    writeToPersistance(): void {
        null
    }

    toggleSidebar(): void {
        this.leftSidebar = !this.leftSidebar;
    }

    setActiveItem(id: string): void {
        this.activeitem = id;
    }

    // updateItem(id: string, field: string, value: unknown): void {
    //     const item = rootStore.storyContentObjectRegistry.getRegisteredValue(id);
    //     if (item) {

    //     }
    // }

    get untitledDocument (): boolean {
        return this.file === "";
    }
}
