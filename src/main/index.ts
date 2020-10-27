import { app, BrowserWindow, Menu, MenuItem } from "electron";
import { patchMenu } from './menus';

const windows: Electron.BrowserWindow[] = [];

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        // frame: false,
        titleBarStyle: "hidden",
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true
        }
    });

    win.loadFile("./dist/index.html");
    // win.webContents.openDevTools();
    return win
}

app
.whenReady()
.then(() => {
    windows.push(createWindow());
})
.then(() => patchMenu(windows[0]));

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
});
