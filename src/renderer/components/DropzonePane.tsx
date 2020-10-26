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

export class DropzonePane extends Component<IDropzonePaneProps, {}> {

    deleter = new MoveableItem("Delete", 0, 0);
    
    constructor(props: IDropzonePaneProps) {
        super(props);

        props.uistate.appendMoveableItem(this.deleter);

        autorun(() => {
            console.log("Updating Pane", props.uistate.moveableItems);
            this.setState({});
        })
    }

    render({ uistate }: IDropzonePaneProps) {
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
                uistate.moveableItems.filter(e => (e.name !== "Delete")).map(e => (<Moveable item={e}><button class="btn btn-default">{e.name}</button></Moveable>))
            }
            <Moveable item={this.deleter}><div style="width: 120px; height: 120px; background-color: red;">
                <button class="btn btn-negative" onClick={() => {
                    uistate.clearMoveableItems(this.deleter);
                }}>DELETE</button>
            </div>
            </Moveable>
        </div>
    }

    shouldComponentUpdate(nextProps: any, nxtState: IDropzonePaneState, nxtContext: any) {
        return true;
    }
}