import { Component, h } from "preact";
import { DropzonePane } from "./DropzonePane";
import { Toolbar } from "./Toolbar";

export class App extends Component {

    public render({}, {}) {
        return <div class="window">
            <div class="window-content">
                <div class="pane-group">
                    <div class="pane-sm sidebar">
                        <Toolbar />
                    </div>
                    <DropzonePane></DropzonePane> 
                </div>
  
            </div>
        </div>
    }
}

