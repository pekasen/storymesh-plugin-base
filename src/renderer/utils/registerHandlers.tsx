import { ipcRenderer } from 'electron/renderer';
import { readFile, writeFile } from "fs";
import { deserialize, serialize } from 'serializr';
import { windows } from '../../main';
import { rootStore } from '../index';
import { RootStoreSchema } from "../store/rootStore";

/**
 * registers file-event handlers
 */
export function registerHandlers(): void {
    ipcRenderer.on('save', (e, { file }) => {
        // rootStore.root.uistate.setFile(file);
        const json = serialize(RootStoreSchema, rootStore.root);
        console.log(json)
        if (file !== undefined) {
            rootStore.root.uistate.setFile(file)
        }
        writeFile(
            file || rootStore.root.uistate.file,
            JSON.stringify(json),
            (err) => {
                if (err) throw(err); // if the selected file does not exist, raise hell!
                else {
                    const { root } = rootStore;
                    root.notifications.postNotification("Saved", null, "normal", 5);
                }
            }
        );
    });
    
    ipcRenderer.on('load', (e, { file }) => {
        // rootStore.root.uistate.setFile(file);
        // rootStore.root.reset();

        readFile(file, { encoding: 'UTF8' }, (err, data) => {
            if (err)
                throw err;
            const parsedData = JSON.parse(data);
            if (parsedData) {
                deserialize(RootStoreSchema, parsedData, (err, result) => {
                    if (err) throw(err);
                    
                    console.log("Heres what's loaded", result);
                    rootStore.root.replace(result);
                }, null);
            }
        });
    });
    
    ipcRenderer.on('request', () => {
        ipcRenderer.send('request-reply', {
            file: rootStore.root.uistate.file
        });
    });
    
    ipcRenderer.on('new', () => {
        rootStore.root.reset();
    });

    ipcRenderer.on('delete', () => {
        const selectedItemIds = rootStore.root.uistate.selectedItems.ids;
        const reg = rootStore.root.storyContentObjectRegistry;
        console.log("delete", selectedItemIds);
        
        selectedItemIds.forEach(selectedItemID => {
            const selectedItem = reg.getValue(selectedItemID);
            if ( selectedItem && selectedItem.parent && selectedItem.deletable) {
                const parentItem = reg.getValue(selectedItem.parent)
                // remove ties
                parentItem?.childNetwork?.disconnect(reg, selectedItem.connections);
                // and die
                parentItem?.childNetwork?.removeNode(reg, selectedItem);
                rootStore.root.uistate.moveableItems.deregister(selectedItemID);
            }
        });
    });
}
