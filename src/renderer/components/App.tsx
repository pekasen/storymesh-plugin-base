import { Component, h } from "preact";
import { Toolbar } from "./Toolbar";

export class App extends Component {

    public render({}, {}) {
        return <div id="ngwebs-editor">
            <Toolbar />
        </div>
    }
}

