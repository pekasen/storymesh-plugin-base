import { Component, h } from "preact";
import { List } from "../store/List";

import { UIStore } from "../store/UIStore";

import { DropzonePane } from "./DropzonePane";
import { Toolbar } from "./Toolbar";
import { Window } from "./Window";

interface IAppProps {
    list: List
    uistate: UIStore
}

export class App extends Component<IAppProps,{}> {

    constructor (props: IAppProps) {
        super(props);
    }

    public render( { list, uistate }: IAppProps, {}) {
        console.log("rerender", this);

        return <Window>
            
            <header class="toolbar toolbar-header">
                <h1 class="title">Header with actions</h1>

                <div class="toolbar-actions">
                    <div class="btn-group">
                    <button class="btn btn-default">
                        <span class="icon icon-home"></span>
                    </button>
                    <button class="btn btn-default">
                        <span class="icon icon-folder"></span>
                    </button>
                    <button class="btn btn-default active">
                        <span class="icon icon-cloud"></span>
                    </button>
                    <button class="btn btn-default">
                        <span class="icon icon-popup"></span>
                    </button>
                    <button class="btn btn-default">
                        <span class="icon icon-shuffle"></span>
                    </button>
                    </div>

                    <button class="btn btn-default">
                    <span class="icon icon-home icon-text"></span>
                    Filters
                    </button>

                    <button class="btn btn-default btn-dropdown pull-right">
                    <span class="icon icon-megaphone"></span>
                    </button>
                </div>
                </header>
                <div class="window-content">
                    <div class="pane-group">
                        <div class="pane-sm">
                            <Toolbar list={list} uistate={uistate} />
                        </div>
                        <DropzonePane uistate={uistate}></DropzonePane> 
                    </div>
                </div>
                <footer class="toolbar toolbar-footer">
                    <div class="toolbar-actions">
                        <button class="btn btn-default">
                        Cancel
                        </button>

                        <button class="btn btn-primary pull-right">
                        Save
                        </button>
                    </div>
                </footer>
        </Window>
    }
}

