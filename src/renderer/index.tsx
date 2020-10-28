import { App } from "./components/App";
import { render, h } from "preact";
import { List } from './store/List';
import { ListItem } from './store/ListItem';
import { registerHandlers } from './utils/registerHandlers';
import { RootStore } from './store/rootStore';

export var model = new List([
    new ListItem("Philipp", "Lead"),
    new ListItem("Jannik", "Frontend"),
    new ListItem("Anca", "Backend")
]);

export var rootStore = new RootStore(model);
// export const UUIDNameSpace = "e5e3a5f7-5153-4859-87e3-4ecb36f2678b";

registerHandlers();

const root = document.getElementById("preact-root") as Element;
render(
    <App list={rootStore.model} uistate={rootStore.uistate}></App>,
    root
);
