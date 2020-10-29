import { App } from "./components/App";
import { render, h } from "preact";
import { List } from './store/List';
import { ListItem } from './store/ListItem';
import { registerHandlers } from './utils/registerHandlers';
import { RootStore } from './store/rootStore';

export const model = new List([
    new ListItem("Philipp", "Lead"),
    new ListItem("Jannik", "Frontend"),
    new ListItem("Anca", "Backend")
]);
export const rootStore = new RootStore(model);

registerHandlers();

const root = document.getElementById("preact-root") as Element;
render(
    <App list={rootStore.model} uistate={rootStore.uistate}></App>,
    root
);
