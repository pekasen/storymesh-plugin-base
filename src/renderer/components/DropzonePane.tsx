import { autorun } from 'mobx';
import { Component, h } from "preact";
import { UIStore } from '..';
import { Moveable, MoveableItem } from './Moveable';
import { IListItem } from './Toolbar';

interface IMoveableListItem extends IListItem {
   x: number,
   y: number 
}

interface IDropzonePaneState {
    list: IMoveableListItem[]
}

interface IDropzonePaneProps {
    uistate: UIStore
}

export class DropzonePane extends Component<IDropzonePaneProps, IDropzonePaneState> {

    constructor(props: IDropzonePaneProps) {
        super(props);
        // this.state = {
        //     list: []
        // };

        autorun(() => {
            console.log("Updating Pane", props.uistate.moveableItems);
            props.uistate.moveableItems.map(e => {
                console.log(e.name + " updated", e.x, e.y);
                this.forceUpdate();
            })
            this.forceUpdate();
        })
    }

    render({ uistate }: IDropzonePaneProps, state: IDropzonePaneState) {
        return <div
            class="pane"
            onDrop={(e) => {
                e.preventDefault();
                const data = JSON.parse(e.dataTransfer?.getData("text") || "");

                if (e.target) {
                    const elem = e.target as Element;
                    const boundingRect = elem.getBoundingClientRect();

                    if (data !== {}) {
                        uistate.appendMoveableItem(new MoveableItem(data.name, e.clientX - boundingRect.left, e.clientY - boundingRect.top));
                    }
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
            }}
        >
            {
                uistate.moveableItems.map(e => (<Moveable item={e}><button class="btn btn-default">{e.name}</button></Moveable>))
            }
            {/* <Moveable x={2} y={4}><div style="width: 120px; height: 120px; background-color: red;">
                <button class="btn btn-negative" onClick={() => {
                    this.setState({
                        list: []
                    });
                }}>DELETE</button>
            </div>
            </Moveable> */}
        </div>
    }

    // shouldComponentUpdate(nxtProps: any, nxtState: IDropzonePaneState, nxtContext: any) {
    //     return this.state !== nxtState
    // }
}