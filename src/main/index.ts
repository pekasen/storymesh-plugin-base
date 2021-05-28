import { app, BrowserWindow, ipcMain } from "electron";
import { patchMenu } from './menus';
// import installExtension, { REACT_DEVELOPER_TOOLS } from "electron-devtools-installer";
// import Logger from "js-logger";

export const windows: Electron.BrowserWindow[] = [];

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        // frame: false,
        titleBarStyle: "hidden",
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true,
            enableRemoteModule: true
        }
    });
    // installExtension([
    //     REACT_DEVELOPER_TOOLS
    //     // {
    //     //     id: "pfgnfdagidkfgccljigdamigbcnndkod",
    //     //     electron: ">=1.2.1"
    //     // },
    //     // {
    //     //     id: "ilcajpmogmhpliinlbcdebhbcanbghmd",
    //     //     electron: ">=1.2.1"
    //     // },
    // ], true)
    // .then((value) => Logger.info(`Loaded ${value}`))
    // .catch(() => console.warn("failed to load devtools extension"))

    win.loadFile("./dist/index.html");
    // win.webContents.openDevTools();
    return win
}

app
    .whenReady()
    .then(() => {
        windows.push(createWindow());
    })
    .then(() => patchMenu());

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

ipcMain.on("preferences", () => {
    windows.forEach((window) => {
        window.webContents.send("reload-preferences", {});
    });
});
