import { h, JSX } from "preact";
import { useRef } from "preact/hooks";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";

export class HSliderMenuItem implements IMenuItemRenderer {
    render(item: IMenuTemplate): JSX.Element {
        const pRef = useRef<HTMLParagraphElement>(undefined);

        const formatString = (val: number) => `${val} Column${(val === 1) ? "" : "s"}`

        return <div class="form-group-item">
            <label>{item.label}</label>
            <input
                type="range"
                min={item.options?.min}
                max={item.options?.max}
                value={item.value()}
                class="slider" 
                onInput={(e: Event) => {
                    const target = e.target as HTMLInputElement
                    
                    if (item.valueReference && target.value && target.value !== item.value().length) {
                        item.valueReference(target.value);
                        if (pRef && pRef.current && pRef !== null && pRef.current !== null) {
                            pRef.current.innerHTML = formatString(Number(target.value));
                        }
                    }
                }}
            />
            <p ref={pRef}>{formatString(item.value())}</p>
        </div>
    }
}

export const plugInExport = exportClass(
    HSliderMenuItem,
    "",
    "internal.pane.hslider",
    "",
    false
);
