import { Component, h } from "preact";
import { Moveable } from './Moveable';
import { Toolbar } from "./Toolbar";
import { DropzonePane } from "./DropzonePane";

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

