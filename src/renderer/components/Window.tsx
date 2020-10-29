import { h } from "preact";

interface IWindowProps {
    children: h.JSX.Element[]
}

export const Window = ({ children }: IWindowProps): h.JSX.Element => (
    <div class="window">{...children}</div>
)