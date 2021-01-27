import { h } from "preact";
import { ObservableStoryModifier } from "./AbstractModifier";

export interface CSSStatement {
    [key: string]: string
}

export interface CSSModifierData {
    classes: string[]
    inline: CSSStatement
}

export abstract class CSSModifier extends ObservableStoryModifier<CSSModifierData> {
    public abstract data: CSSModifierData;
    public modify(element: h.JSX.Element): h.JSX.Element {
        const inline: string = Object.
        keys(this.data?.inline).
        map((key) => (`${key}: ${this.data.inline[key]}`)).
        join("; ");

        function concatSafely(string: string | undefined, string2: string) {
            if (!string) return string2
            else return string + string2
        }

        if (this.type === "css-class" || this.type === "css-hybrid") element.props["class"] = concatSafely(element.props["class"], this.data?.classes.join(" "));
        if (this.type === "css-inline" || this.type === "css-hybrid") element.props["style"] = concatSafely(element.props["style"], inline);
        
        return element;
    }
}
