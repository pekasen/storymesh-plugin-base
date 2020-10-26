import { render, h } from "preact";
import { App } from "./components/App";
import { action, makeAutoObservable, makeObservable, observable } from "mobx";
import { Moveable, MoveableItem } from './components/Moveable';

export class ListItem {
    public name: string
    public type?: string

    constructor (name: string, type?: string) {
        this.name = name;
        if ( type ) {
            this.type = type;
        }

        makeObservable(this, {
            name: observable,
            type: observable,
            changeName: action
        });
    }

    changeName (name: string) {
        this.name = name;
    }
}

export class List {
    public members: ListItem[]

    constructor (members?: ListItem[]) {
        this.members = members || [];
        makeAutoObservable(this);
    }

    addMember (name: string, type: string) {
        this.members = [...this.members, new ListItem(name, type)];
    }
}


export class UIStore {
    searchResults: ListItem[]
    moveableItems: MoveableItem[]
    term: string


    constructor () {
        this.searchResults = [];
        this.moveableItems = [];
        this.term  = "";
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
            const keep = this.moveableItems.filter((item) => (item === butKeep))
            this.moveableItems = keep;
        } else {
            this.moveableItems = [];
        }
    }

    setSearchTerm(term: string) {
        this.term = term;
    }
}

var model = new List([
    new ListItem("Philipp", "Lead"),
    new ListItem("Jannik", "Frontend"),
    new ListItem("Anca", "Backend")
]);

const root = document.getElementById("preact-root") as Element;
render(
    <App list={model} uistate={new UIStore()}></App>,
    root
);
