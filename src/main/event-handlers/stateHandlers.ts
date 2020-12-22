import { MenuItem, BrowserWindow } from "electron";

export const handleUndo = (menuItem: MenuItem, window: BrowserWindow | undefined): void => {
    if (window) {
        window.webContents.send('undo');
    }
};

export const handleRedo = (menuItem: MenuItem, window: BrowserWindow | undefined): void => {
    if (window) {
        window.webContents.send('redo');
    }
};