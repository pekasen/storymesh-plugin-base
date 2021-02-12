import { h, JSX } from "preact";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";

export class TextAreaMenuItem implements IMenuItemRenderer {
    render(item: IMenuTemplate): JSX.Element {
        return <div class="form-group-item">
            <label>{item.label}</label>
            <textarea class="form-control" rows={5}  onInput={(e: Event) => {
                const target = e.target as HTMLInputElement
                
                if (item.valueReference && target.value && target.value !== item.value().length) {
                    item.valueReference(target.value);
                }
            }}>{item.value() as string}</textarea>
        </div>
    }
}

export const plugInExport = exportClass(
    TextAreaMenuItem,
    "",
    "internal.pane.textarea",
    "",
    false
);
