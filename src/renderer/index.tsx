import { App } from "./components/App";
import { render, h } from "preact";
import { UIStore } from './store/UIStore';
import { List } from './store/List';
import { ListItem } from './store/ListItem';
import { ipcRenderer } from 'electron/renderer';
import { readFile, writeFile } from "fs";

var model = new List([
    new ListItem("Philipp", "Lead"),
    new ListItem("Jannik", "Frontend"),
    new ListItem("Anca", "Backend")
]);

ipcRenderer.on('save', (e, arg) => {
    writeFile(
        "/Users/philipp/Desktop/test.json",
        JSON.stringify(model),
        (err) => {
            if (err) console.error(err)
            else console.log("Wrote a file");
        }
    )
});

ipcRenderer.on('load', (e, arg) => {
    readFile(arg.file, {encoding: 'UTF8'}, (err, data) => {
        const parsedData = JSON.parse(data);
        if (parsedData.members) {
            model.loadMembers(parsedData.members)
        }
    });
});

const root = document.getElementById("preact-root") as Element;
render(
    <App list={model} uistate={new UIStore()}></App>,
    root
);
