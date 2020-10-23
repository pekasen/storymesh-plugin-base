import { render, h } from "preact";
import { App } from "./components/App";
import { action, autorun, makeAutoObservable, makeObservable, observable } from "mobx";

class MoveableItem {

    public name: string
    public x: number
    public y: number

    constructor (name: string, x: number, y: number) {
        makeObservable(this, {
            name: observable,
            x: observable,
            y: observable
        });
        
        this.name = name;
        this.x = x;
        this.y = y;
    }

    updatePosition (x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    updateName (name: string) {
        this.name = name;
    }
}

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

    constructor () {
        makeAutoObservable(this);
        this.searchResults = [];
    }

    setSearchResults(items: ListItem[]) {
        this.searchResults = items;
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
