import { FunctionalComponent, h } from "preact";


export const Window: FunctionalComponent = ({ children }) => (
    <div class="window">{children}</div>
)

export const WindowContent: FunctionalComponent = ({ children })=> (
    <div class="window-content">{children}</div>
)