import { ipcRenderer } from 'electron/renderer';
import { readFile, writeFile } from "fs";
import { rootStore, model } from './index';

export function registerHandlers() {
    ipcRenderer.on('save', (e, { file }) => {
        console.log(file);
        writeFile(
            (file !== undefined) ? file : rootStore.uistate.file,
            JSON.stringify(model),
            (err) => {
                if (err)
                    console.error(err);
                else {
                    console.log("Wrote a file");
                    rootStore.uistate.setFile(file);
                }
            }
        );
    });
    ipcRenderer.on('load', (e, { file }) => {
        readFile(file, { encoding: 'UTF8' }, (err, data) => {
            if (err)
                throw err;
    
            const parsedData = JSON.parse(data);
            if (parsedData.members) {
                model.loadMembers(parsedData.members);
                rootStore.uistate.setFile(file);
            }
        });
    });
    ipcRenderer.on('request', () => {
        ipcRenderer.send('request-reply', {
            file: rootStore.uistate.file
        });
    });
    ipcRenderer.on('new', () => {
        model.clear();
        rootStore.uistate.clearMoveableItems();
    });
}
