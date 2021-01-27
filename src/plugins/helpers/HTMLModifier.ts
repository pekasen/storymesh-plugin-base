import { h } from "preact";
import { ObservableStoryModifier } from "./AbstractModifier";

export interface HTMLModifierData {
    [key: string]: string
}

export abstract class HMTLModifier extends ObservableStoryModifier<HTMLModifierData> {
    public abstract modifyHTML(element: h.JSX.Element): h.JSX.Element
}