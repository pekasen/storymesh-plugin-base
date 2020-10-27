import { MenuItem, webContents } from 'electron';

export const handleSaveEvent = (menuItem: MenuItem, window: Electron.BrowserWindow | undefined, event: Electron.KeyboardEvent) => {
    console.log(event);
    window?.webContents.send('save', {hello: 'Hello from mainland'})
};

export const handleLoadEvent = (menuItem: MenuItem, window: Electron.BrowserWindow | undefined, event: Electron.KeyboardEvent) => {
    window?.webContents.send('load', {file: "/Users/philipp/Desktop/test.json"})
}