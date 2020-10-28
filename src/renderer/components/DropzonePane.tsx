import { autorun, reaction } from 'mobx';
import { Component, createRef, h } from "preact";

import Two = require('twojs-ts');
import { UIStore } from "../store/UIStore";

import { Moveable } from './Moveable';
import { MoveableItem } from "../store/MoveableItem";
import { List } from '../store/List';
import { ListItem } from '../store/ListItem';

interface IDropzonePaneProps {
    uistate: UIStore
    model: List
}

export class DropzonePane extends Component<IDropzonePaneProps, {}> {

    two: Two;
    ref = createRef();
    deleter = new MoveableItem(new ListItem("Delete", "DELETER"), 0, 0);
    
    constructor(props: IDropzonePaneProps) {
        super(props);
        this.two = new Two({
            type: Two.Types.canvas,
            fullscreen: false
          });
        props.uistate.appendMoveableItem(this.deleter);

        // autorun(() => {
        //     console.log("Updating Pane", props.uistate.moveableItems);
        //     this.setState({});
        // })

        reaction(
            () => (props.uistate.moveableItems),
            () => {
                this.setState({});
            }
        );
    }
    
    componentDidMount() {
        var two = this.two;
        
        var circle = two.makeCircle(72, 100, 50);
        var rect = two.makeRectangle(413, 100, 100, 100);      
        
        circle.fill = '#FF8000';
        circle.stroke = 'orangered'; 
        circle.linewidth = 5;
        
        rect.fill = 'rgb(0, 200, 255)';
        rect.opacity = 0.75;
        rect.noStroke();

        two.appendTo(this.ref.current).update();
    }

    render({ uistate, model }: IDropzonePaneProps) {
        console.log(uistate.moveableItems);
        return <div ref={this.ref}
            class="pane"
            onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer?.getData("text") || undefined;
                console.log(id);

                if (e.target) {
                    const elem = e.target as Element;
                    const boundingRect = elem.getBoundingClientRect();

                    if (id !== undefined) {
                        const data = model.itemByID(id);
                        console.log(data);
                        if (data) uistate.appendMoveableItem(new MoveableItem(data, e.clientX - boundingRect.left, e.clientY - boundingRect.top));
                    }
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
            }}
        >
            {
                uistate.moveableItems.filter(e => (e.data.name !== "Delete")).map(e => (<Moveable item={e}><button class="btn btn-default">{e.data.name}</button></Moveable>))
            }
            <Moveable item={this.deleter}><div style="width: 120px; height: 120px; background-color: red;">
                <button class="btn btn-negative" onClick={() => {
                    uistate.clearMoveableItems(this.deleter);
                }}>DELETE</button>
            </div>
            </Moveable>
        </div>
    }
}
