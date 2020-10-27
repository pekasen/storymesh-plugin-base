import { h } from "preact";

interface IWindowProps {
    children: h.JSX.Element[]
}

export const Window = ({ children }: IWindowProps) => (
    <div class="window">{...children}</div>
)