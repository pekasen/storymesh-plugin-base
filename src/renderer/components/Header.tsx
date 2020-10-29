import { h } from "preact";

interface IHeaderProps {
    title: string;
    leftToolbar: preact.JSX.Element[]
    children?: preact.JSX.Element[] | undefined
}
export const Header = ({ title, leftToolbar }: IHeaderProps): h.JSX.Element => (
    <header class="toolbar toolbar-header">
        <h1 class="title">{title}</h1>

        <div class="toolbar-actions">
                {...leftToolbar}
            {/* <div class="btn-group">
            </div> */}

            <button class="btn btn-default">
                <span class="icon icon-home icon-text"></span>
                        Filters
            </button>
        </div>
    </header>
);
