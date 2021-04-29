import { MenuItem, BrowserWindow, dialog, ipcMain } from 'electron';

export const handleSaveEvent = (menuItem: MenuItem, window: BrowserWindow | undefined): void => {
    window?.webContents.send('request', { uistate: 'file'});
    
    ipcMain.once('request-reply', (e, args) => {
        const isUntitled = args.file === "";

        if(window ) {
            if (isUntitled) dialog.showSaveDialog(window, {
                title: "Save",
                filters: [{name: "NGWebS Project", extensions: ["json"]}]
            }).then((v) => {
                window.webContents.send('save', {file: v.filePath})
            })
            else {
                window?.webContents.send('save', {})
            }
        } 
    });    
};

export const handleLoadEvent = (menuItem: MenuItem, window: BrowserWindow | undefined): void => {
    if (window) dialog.showOpenDialog(window, {
        title: "Open a file",
        properties: [
            "openFile"
        ]
    }).then((v) => {
        window?.webContents.send('load', {file: v.filePaths[0]})
    })
}

export const handleNewDocumentEvent = (menuItem: MenuItem, window: BrowserWindow | undefined): void => {
    if (window) {
        window.webContents.send('new');
    }
};

export const handleDeleteEvent =  (menuItem: MenuItem, window: BrowserWindow | undefined): void => {
    if (window) {
        window.webContents.send('delete');
    }
};

export const handleExportEvent = (menuItem: MenuItem, window: BrowserWindow | undefined): void => {
    if (window) {
        dialog.showSaveDialog(window, {
            title: "Export",
            filters: [{name: "NGWebS Project", extensions: ["json"]}]
        }).then((v) => {
            window.webContents.send('export', { file: v.filePath })
        });
    }
}
