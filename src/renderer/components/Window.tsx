import { FunctionalComponent, h } from "preact";
import { useContext } from "preact/hooks";
import { Store } from "..";


export const Window: FunctionalComponent = ({ children }) => (
    <div class="window">{children}</div>
)

export const WindowContent: FunctionalComponent = ({ children })=> (
    <div class="window-content theme-eggplant">{children}</div>
)

export const ThemedWindowContent: FunctionalComponent = ({ children })=> {
    const { userPreferences } = useContext(Store);

    return <div class={`window-content theme-${userPreferences.theme}`}>{children}</div>
}