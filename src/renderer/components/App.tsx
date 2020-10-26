import { Component, h } from "preact";
import { List } from "../store/List";

import { UIStore } from "../store/UIStore";

import { DropzonePane } from "./DropzonePane";
import { Toolbar } from "./Toolbar";

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

        return <div class="window">
            <div class="window-content">
                <div class="pane-group">
                    <div class="pane-sm sidebar">
                        <Toolbar list={list} uistate={uistate} />
                    </div>
                    <DropzonePane uistate={uistate}></DropzonePane> 
                </div>

            </div>
        </div>
    }
}

