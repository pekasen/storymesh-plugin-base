import { h, JSX } from "preact";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";

export class ButtonMenuItem implements IMenuItemRenderer {
    render(item: IMenuTemplate): JSX.Element {
        return <div class="form-group-item">
            <button class="btn btn-default" onClick={() => {
                if (item.valueReference) item.valueReference()
            }}>{item.label}</button>
        </div>
    }
}

export const plugInExport = exportClass(
    ButtonMenuItem,
    "",
    "internal.pane.button",
    "",
    false
);


// (e) => {
//     let _type = "";
//     let _dir = "";
//     const contextMenu = new Menu();
//     ["flow","reaction","data"].forEach(f => {
//         contextMenu.append(new MenuItem({
//             label: f,
//             click: () => _type = f
//         }))
//     });
//     contextMenu.popup({
//         window: remote.getCurrentWindow(),
//         x: e.x,
//         y: e.y
//     });
//     const contextMenu2 = new Menu();
//     ["in","out"].forEach(f => {
//         contextMenu2.append(new MenuItem({
//             label: f,
//             click: () => _dir = f
//         }))
//     });
//     contextMenu2.popup({
//         window: remote.getCurrentWindow(),
//         x: e.x,
//         y: e.y
//     });

//     if (item && item.valueReference) item.valueReference(_type, _dir);
// }
