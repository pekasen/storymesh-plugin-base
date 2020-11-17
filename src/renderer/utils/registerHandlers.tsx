import { ipcRenderer } from 'electron/renderer';
import { readFile, writeFile } from "fs";
import { rootStore, } from '../index';

/**
 * registers file-event handlers
 */
export function registerHandlers(): void {
    ipcRenderer.on('save', (e, { file }) => {

        writeFile(
            (file !== undefined) ? file : rootStore.uistate.file,
            JSON.stringify(rootStore),
            (err) => {
                if (err) throw(err); // if the selected file does not exist, raise hell!
                else {
                    if (file !== undefined) {
                        rootStore.uistate.setFile(file)
                    }
                }
            }
        );
    });
    
    ipcRenderer.on('load', (e, { file }) => {
        readFile(file, { encoding: 'UTF8' }, (err, data) => {
            if (err)
                throw err;
    
            const parsedData = JSON.parse(data);
            if (parsedData) {
                rootStore.loadFromPersistance(parsedData);
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
        rootStore.reset();
    });

    ipcRenderer.on('delete', () => {
        const selectedItemIds = rootStore.uistate.selectedItems.ids;
        const reg = rootStore.storyContentObjectRegistry;
        console.log("delete", selectedItemIds);
        
        selectedItemIds.forEach(selectedItemID => {
            const selectedItem = reg.getValue(selectedItemID);
            if ( selectedItem && selectedItem.parent ) {
                const parentItem = reg.getValue(selectedItem.parent)

                parentItem?.childNetwork?.removeNode(reg, selectedItem);
                rootStore.uistate.moveableItems.deregister(selectedItemID);
            }
        });
    });
}
