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

                if (e.target) {
                    const elem = e.target as Element;
                    const boundingRect = elem.getBoundingClientRect();

                    if (data !== {}) {
                        const last_state = this.state;
                        last_state.list.push(
                            {...data, x: e.clientX - boundingRect.left, y: e.clientY - boundingRect.top}
                        );
                        this.setState(last_state);
                    }
                }

            }}
            onDragOver={(e) => {
                e.preventDefault();
            }}
        >
            {
                state.list.map(e => (<Moveable x={e.x} y={e.y}><button class="btn btn-default">{e.name}</button></Moveable>))
            }
            <Moveable x={2} y={4}><div style="width: 120px; height: 120px; background-color: red;">
                <button class="btn btn-negative" onClick={() => {
                    this.setState({
                        list: []
                    });
                }}>DELETE</button>
            </div>
            </Moveable>
        </div>
    }

    shouldComponentUpdate(nxtProps: any, nxtState: IDropzonePaneState, nxtContext: any) {
        return this.state !== nxtState
    }
}