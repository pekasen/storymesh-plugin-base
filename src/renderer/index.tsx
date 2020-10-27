import { App } from "./components/App";
import { render, h } from "preact";
import { UIStore } from './store/UIStore';
import { List } from './store/List';
import { ListItem } from './store/ListItem';
import { registerHandlers } from './registerHandlers';

export var model = new List([
    new ListItem("Philipp", "Lead"),
    new ListItem("Jannik", "Frontend"),
    new ListItem("Anca", "Backend")
]);

export var rootStore = {
    model: model,
    uistate: new UIStore()
}

registerHandlers();

const root = document.getElementById("preact-root") as Element;
render(
    <App list={model} uistate={rootStore.uistate}></App>,
    root
);
