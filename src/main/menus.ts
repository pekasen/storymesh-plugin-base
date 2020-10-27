import { app, Menu, MenuItem } from "electron";
import { MenuItemConstructorOptions } from 'electron/main';
import { handleSaveEvent, handleLoadEvent } from './event-handlers/save-handler';

export function patchMenu(window: Electron.BrowserWindow) {
    const isMac = process.platform === 'darwin'
    const appMenu: MenuItemConstructorOptions =  {
        label: app.name,
        submenu: [

            { role: 'about' },
            { type: 'separator' },
            { role: 'services' },
            { type: 'separator' },
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' }
        ]
    };
    const fileMenu: MenuItemConstructorOptions = {
        label: 'File',
        submenu: [
            isMac ? { role: 'close' } : { role: 'quit' },
            {
                label: 'Save',
                accelerator: 'CommandOrControl+S',
                click: handleSaveEvent
            },
            {
                label: 'Load',
                accelerator: 'CommandOrControl+O',
                click: handleLoadEvent
            }
        ]
    }
    const devMenu: MenuItemConstructorOptions =  {
        label: 'Developer',
        submenu: [
            { role: 'reload' },
            { role: 'forceReload' },
            { role: 'toggleDevTools' },
            { type: 'separator' },
            { role: 'resetZoom' },
            { role: 'zoomIn' },
            { role: 'zoomOut' },
            { type: 'separator' },
            { role: 'togglefullscreen' }
        ]
    };
    const template = [
        appMenu,
        fileMenu,
        devMenu
    ];
        // { role: 'appMenu' }
        // ,
        // { role: 'fileMenu' }
        
        //   ,
        //   // { role: 'editMenu' }
        //   {
        //     label: 'Edit',
        //     submenu: [
        //       { role: 'undo' },
        //       { role: 'redo' },
        //       { type: 'separator' },
        //       { role: 'cut' },
        //       { role: 'copy' },
        //       { role: 'paste' },
        //       ...(isMac ? [
        //         { role: 'pasteAndMatchStyle' },
        //         { role: 'delete' },
        //         { role: 'selectAll' },
        //         { type: 'separator' },
        //         {
        //           label: 'Speech',
        //           submenu: [
        //             { role: 'startspeaking' },
        //             { role: 'stopspeaking' }
        //           ]
        //         }
        //       ] : [
        //         { role: 'delete' },
        //         { type: 'separator' },
        //         { role: 'selectAll' }
        //       ])
        //     ]
        //   },
        //   // { role: 'viewMenu' }
        //   ,
        //   // { role: 'windowMenu' }
        //   {
        //     label: 'Window',
        //     submenu: [
        //       { role: 'minimize' },
        //       { role: 'zoom' },
        //       ...(isMac ? [
        //         { type: 'separator' },
        //         { role: 'front' },
        //         { type: 'separator' },
        //         { role: 'window' }
        //       ] : [
        //         { role: 'close' }
        //       ])
        //     ]
        //   },
        //   {
        //     role: 'help',
        //     submenu: [
        //       {
        //         label: 'Learn More',
        //         click: async () => {
        //           const { shell } = require('electron')
        //           await shell.openExternal('https://electronjs.org')
        //         }
        //       }
        //     ]
        //   }
    // ]
    
    const menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu)
    
    
    // Menu.setApplicationMenu(appMenu);
    // console.log(appMenu);
}