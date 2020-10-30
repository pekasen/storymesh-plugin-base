import { MenuItem, BrowserWindow, KeyboardEvent, dialog, ipcMain } from 'electron';

export const handleSaveEvent = (menuItem: MenuItem, window: BrowserWindow | undefined, event: KeyboardEvent): void => {
    window?.webContents.send('request', { uistate: 'file'});
    
    ipcMain.once('request-reply', (e, args) => {
        const isUntitled = args.file === "";

        if(window && isUntitled) {
            dialog.showSaveDialog(window, {
                title: "Save",
                filters: [{name: "NGWebS Project", extensions: ["json"]}]
            }).then((v) => {
                window?.webContents.send('save', {file: v.filePath})
            })
        } else {
            window?.webContents.send('save', {})
        }
    });    
};

export const handleLoadEvent = (menuItem: MenuItem, window: BrowserWindow | undefined, event: KeyboardEvent): void => {
    if (window)  dialog.showOpenDialog(window, {
        title: "Open a file",
        properties: [
            "openFile"
        ]
    }).then((v) => {
        window?.webContents.send('load', {file: v.filePaths[0]})
    })
}

export const handleNewDocumentEvent = (menuItem: MenuItem, window: BrowserWindow | undefined, event: KeyboardEvent): void => {
    if (window) {
        window.webContents.send('new');
    }
};