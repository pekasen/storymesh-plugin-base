import { render, h } from "preact";
import { App } from "./components/App";
import { action, autorun, makeAutoObservable, makeObservable, observable } from "mobx";
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
        makeObservable(this, {
            members: observable,
            addMember: action
        })
    }

    addMember (name: string, type: string) {
        this.members = [...this.members, new ListItem(name, type)];
    }
}

export class UIStore {
    searchResults: ListItem[]
    moveableItems: MoveableItem[]

    constructor () {
        this.searchResults = [];
        this.moveableItems = [];
        makeAutoObservable(this);
    }

    setSearchResults(items: ListItem[]) {
        this.searchResults = items;
    }

    appendMoveableItem(item: MoveableItem) {
        this.moveableItems = [...this.moveableItems, item];
    }
}

var model = new List([
    new ListItem("Philipp", "Lead"),
    new ListItem("Jannik", "Frontend"),
    new ListItem("Anca", "Backend")
]);

autorun((r) => {
    console.log("Update!", model.members);
})

const root = document.getElementById("preact-root") as Element;
render(
    // <App list={new List()} />,
    <div>
        <App list={model} uistate={new UIStore()}></App>
    </div>,
    root
);
