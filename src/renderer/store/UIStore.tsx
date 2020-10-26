import { makeAutoObservable } from "mobx";
import { MoveableItem } from "./MoveableItem";
import { ListItem } from "./ListItem";

export class UIStore {
    searchResults: ListItem[];
    moveableItems: MoveableItem[];
    term: string;


    constructor() {
        this.searchResults = [];
        this.moveableItems = [];
        this.term = "";
        makeAutoObservable(this);
    }

    setSearchResults(items: ListItem[]) {
        console.log(items);
        this.searchResults = items;
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
}
