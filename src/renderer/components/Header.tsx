import { h } from "preact";

interface IHeaderProps {
    title: string;
    leftToolbar: preact.JSX.Element[]
    rightToolbar: preact.JSX.Element[]
    children?: preact.JSX.Element[] | undefined
}
export const Header = ({ title, leftToolbar, rightToolbar }: IHeaderProps): h.JSX.Element => (
    <header class="toolbar toolbar-header">
        <h1 class="title">{title}</h1>

        <div class="toolbar-actions">
                {...leftToolbar}
                {...rightToolbar}
        </div>
    </header>
);
