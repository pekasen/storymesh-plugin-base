import { h, JSX } from "preact";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";

export interface ButtonGroupOptions {
    valueReference: () => void
    label: string;
}

export class ButtonMenuItem implements IMenuItemRenderer {
    render(item: IMenuTemplate): JSX.Element {
        return <div class="form-group-item">
            <div class={"btn-group"}>
                {
                    item.options.callbacks.map((e: ButtonGroupOptions) => {
                        return <button class="btn btn-default" onClick={() => {
                            if (e.valueReference) e.valueReference()
                        }}>{e.label}</button>        
                    })
                }
            </div>
        </div>
    }
}

export const plugInExport = exportClass(
    ButtonMenuItem,
    "",
    "internal.pane.buttongroup",
    "",
    false
);