import { h } from "preact";
import { ObservableStoryModifier } from "./AbstractModifier";

export interface HTMLModifierData {
    [key: string]: unknown
}

export abstract class HMTLModifier extends ObservableStoryModifier<HTMLModifierData> {
    public abstract modify(element: h.JSX.Element): h.JSX.Element
}