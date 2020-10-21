import { app, BrowserWindow, Menu, MenuItem } from "electron";

function createWindow() {
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            worldSafeExecuteJavaScript: true
        }
    });

    win.loadFile("./dist/index.html");
    win.webContents.openDevTools();
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        app.quit();
    }
});

app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
});

// const isMac = process.platform === "darwin";
// const template = [
//     // { role: 'appMenu' }
//     ...(isMac ? [{
//       label: app.name,
//       submenu: [
//         { role: 'about' },
//         { type: 'separator' },
//         { role: 'services' },
//         { type: 'separator' },
//         { role: 'hide' },
//         { role: 'hideothers' },
//         { role: 'unhide' },
//         { type: 'separator' },
//         { role: 'quit' }
//       ]
//     }] : []),
//     // { role: 'fileMenu' }
//     {
//       label: 'File',
//       submenu: [
//         isMac ? { role: 'close' } : { role: 'quit' }
//       ]
//     },
//     // { role: 'editMenu' }
//     {
//       label: 'Edit',
//       submenu: [
//         { role: 'undo' },
//         { role: 'redo' },
//         { type: 'separator' },
//         { role: 'cut' },
//         { role: 'copy' },
//         { role: 'paste' },
//         ...(isMac ? [
//           { role: 'pasteAndMatchStyle' },
//           { role: 'delete' },
//           { role: 'selectAll' },
//           { type: 'separator' },
//           {
//             label: 'Speech',
//             submenu: [
//               { role: 'startspeaking' },
//               { role: 'stopspeaking' }
//             ]
//           }
//         ] : [
//           { role: 'delete' },
//           { type: 'separator' },
//           { role: 'selectAll' }
//         ])
//       ]
//     },
//     // { role: 'viewMenu' }
//     {
//       label: 'View',
//       submenu: [
//         { role: 'reload' },
//         { role: 'forcereload' },
//         { role: 'toggledevtools' },
//         { type: 'separator' },
//         { role: 'resetzoom' },
//         { role: 'zoomin' },
//         { role: 'zoomout' },
//         { type: 'separator' },
//         { role: 'togglefullscreen' }
//       ]
//     },
//     // { role: 'windowMenu' }
//     {
//       label: 'Window',
//       submenu: [
//         { role: 'minimize' },
//         { role: 'zoom' },
//         ...(isMac ? [
//           { type: 'separator' },
//           { role: 'front' },
//           { type: 'separator' },
//           { role: 'window' }
//         ] : [
//           { role: 'close' }
//         ])
//       ]
//     },
//     {
//       role: 'help',
//       submenu: [
//         {
//           label: 'Learn More',
//           click: async () => {
//             const { shell } = require('electron')
//             await shell.openExternal('https://electronjs.org')
//           }
//         }
//       ]
//     }
//   ]
  
//   const menu = Menu.buildFromTemplate(template)
//   Menu.setApplicationMenu(menu)