import { h, JSX } from "preact";
import { useRef } from "preact/hooks";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";

export class HSliderMenuItem implements IMenuItemRenderer {
    render(item: IMenuTemplate): JSX.Element {
        const pRef = useRef<HTMLParagraphElement>();

        return <div class="form-group-item slider-item">
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
                            const val = Number(item.value());
                            const string = (item.options.formatter) ? item.options.formatter(val) : val
                            pRef.current.innerHTML = string;
                        }
                    }
                }}
            />
            <p ref={pRef}>{
                (item.options.formatter) ? item.options.formatter(item.value()) : item.value()
            }</p>
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
