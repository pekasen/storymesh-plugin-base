import { app, Menu } from "electron";
import { MenuItemConstructorOptions } from "electron/main";
import { 
    handleSaveEvent, 
    handleLoadEvent,
    handleNewDocumentEvent,
    handleDeleteEvent
} from "./event-handlers/save-handler";

export function patchMenu(): void {
    const isMac = process.platform === "darwin"
    const appMenu: MenuItemConstructorOptions =  {
        label: app.name,
        submenu: [

            { role: "about" },
            { type: "separator" },
            { role: "services" },
            { type: "separator" },
            { role: "hide" },
            { role: "hideOthers" },
            { role: "unhide" },
            { type: "separator" },
            { role: "quit" }
        ]
    };
    const fileMenu: MenuItemConstructorOptions = {
        label: "File",
        submenu: [
            {
                label: "New Document",
                accelerator: "CommandOrControl+N",
                click: handleNewDocumentEvent
            },
            {
                label: "Save",
                accelerator: "CommandOrControl+S",
                click: handleSaveEvent
            },
            {
                label: "Load",
                accelerator: "CommandOrControl+O",
                click: handleLoadEvent
            },
            isMac ? { role: "close" } : { role: "quit" },
        ]
    }
    const devMenu: MenuItemConstructorOptions =  {
        label: "Developer",
        submenu: [
            { role: "reload" },
            { role: "forceReload" },
            { role: "toggleDevTools" },
            { type: "separator" },
            { role: "resetZoom" },
            { role: "zoomIn" },
            { role: "zoomOut" },
            { type: "separator" },
            { role: "togglefullscreen" }
        ]
    };
    const editMenu: MenuItemConstructorOptions = {
        label: "Edit",
        submenu: [
            { role: "undo" },
            { role: "redo" },
            { type: "separator" },
            { role: "cut" },
            { role: "copy" },
            { role: "paste" },
            { 
                label: "delete",
                accelerator: "Delete",
                click: handleDeleteEvent
            },
        //   ...(isMac ? [
            { role: "pasteAndMatchStyle" },
            { role: "selectAll" },
            { type: "separator" },
            {
              label: "Speech",
              submenu: [
                { role: "startSpeaking" },
                { role: "stopSpeaking" }
              ]
            }
        //   ] : [
        //     { role: "delete" },
        //     { type: "separator" },
        //     { role: "selectAll" }
        //   ])
        ]
    };
    const windowMenu: MenuItemConstructorOptions = {
            label: "Window",
            submenu: [
              { role: "minimize" },
              { role: "zoom" },
            //   ...(isMac ? [
                { type: "separator" },
                { role: "front" },
                { type: "separator" },
                { role: "window" }
            //    : 
            //     [{ role: "close" }]
            //   )
            ]
          }
    const template = []
    if (isMac) template.push(appMenu);
    template.push(...[
        fileMenu,
        editMenu,
        windowMenu,
        devMenu
    ]);
        // { role: "appMenu" }
        // ,
        // { role: "fileMenu" }
        
        //   ,
        //   // { role: "editMenu" }
     
    
        //   // { role: "viewMenu" }
        //   ,
        //   // { role: "windowMenu" }
        // ,
        //   {
        //     role: "help",
        //     submenu: [
        //       {
        //         label: "Learn More",
        //         click: async () => {
        //           const { shell } = require("electron")
        //           await shell.openExternal("https://electronjs.org")
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