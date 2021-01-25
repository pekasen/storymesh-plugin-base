import { h } from "preact";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";

export class DividerMenuItem implements IMenuItemRenderer {
    public render(item: IMenuTemplate): h.JSX.Element {
        return <div class="form-group-item"><hr /></div>
    }
}

export const plugInExport = exportClass(DividerMenuItem, "", "internal.pane.divider", "icon-icon")