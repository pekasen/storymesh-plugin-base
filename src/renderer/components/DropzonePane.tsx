import { Component, h } from "preact";
import { Moveable } from './Moveable';
import { IListItem } from './Toolbar';

interface IMoveableListItem extends IListItem {
   x: number,
   y: number 
}

interface IDropzonePaneState {
    list: IMoveableListItem[]
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
                        {...data, x: e.clientX, y: e.clientY}
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
                state.list.map(e => (<Moveable x={e.x} y={e.y}><button class="btn btn-default">{e.name}</button></Moveable>))
            }
            <Moveable x={2} y={4}><button class="btn btn-negative" onClick={() => {
                this.setState({
                    list: []
                });
            }}>DELETE</button></Moveable>
        </div>
    }

    shouldComponentUpdate(nxtProps: any, nxtState: IDropzonePaneState, nxtContext: any) {
        return this.state !== nxtState
    }
}