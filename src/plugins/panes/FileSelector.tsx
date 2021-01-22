import { remote } from "electron";

import { h, JSX } from "preact";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";

interface IMenuItemRenderer {
    render(item: IMenuTemplate): preact.JSX.Element
}

export class FileSelectorMenuItem implements IMenuItemRenderer {
    render(item: IMenuTemplate): JSX.Element {
        return <div class="form-group-item">
            <input class="form-control" type="text" value={item.value()}></input>
            <button class="btn btn-default" onClick={() => {
                const file = remote.dialog.showOpenDialogSync(
                    remote.getCurrentWindow(), {
                        title: "Open scene",
                        properties: [
                            "openFile"
                        ]
                    }
                );

                if (file && file.length === 1 && item.valueReference) item.valueReference(file[0]);
            }}>
                load Scene
            </button>
        </div>
    }
}

export const plugInExport = exportClass(
    FileSelectorMenuItem,
    "",
    "internal.pane.fileselector",
    "",
    true
);
