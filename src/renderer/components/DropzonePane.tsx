import { Component, h } from "preact";
import { Moveable } from './Moveable';
import { IListItem } from './Toolbar';

interface IDropzonePaneState {
    list: IListItem[]
}

export class DropzonePane extends Component<{}, IDropzonePaneState> {

    public state: IDropzonePaneState

    constructor() {
        super();
        this.state = {
            list: []
        };
    }

    render(props: any, state: IDropzonePaneState) {
        return <div
            class="pane"
            onDrop={(e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer?.getData("text") || "");
                
                console.log(data);

                if (data !== {}) {
                    const last_state = this.state;
                    last_state.list.push(
                        data
                    );
                    this.setState(last_state);
                }

                console.log(this.state);

            }}
            onDragOver={(e) => {
                e.preventDefault();
            }}
        >
            {
                state.list.map(e => (<Moveable><button class="btn btn-default">{e.name}</button></Moveable>))
            }
        </div>
    }

    shouldComponentUpdate(nxtProps: any, nxtState: IDropzonePaneState, nxtContext: any) {
        return this.state !== nxtState
    }
}