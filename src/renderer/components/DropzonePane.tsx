import { reaction } from 'mobx';
import { Component, createRef, h } from "preact";
import { IItem } from './IItem';
import Two from 'twojs-ts';
import { UIStore } from "../store/UIStore";

import { Moveable } from './Moveable';
import { MoveableItem } from "../store/MoveableItem";
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';
import { TwoJS } from './TwoJS';
import { RootStore } from "../store/rootStore";

interface IDropzonePaneProps {
    uistate: UIStore//,
    //store: RootStore
}


export class DropzonePane extends Component<IDropzonePaneProps> {
    //two: TwoJS;
    ref = createRef();
    deleter = new MoveableItem("DELETER1", 0, 0);
    deleterBox = new MoveableItem("DELETER2", 110, 110);
    constructor(props: IDropzonePaneProps) {
        super(props); 

        reaction(
            () => (props.uistate.moveableItems),
            () => {
                this.setState({});
            }
        );

        reaction(
            () => (props.uistate.moveableItems.registry.forEach(e => {e.x,  e.y})),
            () => {
                // TODO: pass properties to TwoJS component in render()
                // this.two.updateMyCircles(props.uistate.moveableItems);
                // this.two.updateMyNoodles(props.uistate.moveableItems);
            }
        )
    }
    
    componentDidMount(): void {
       // this.two.svg.appendTo(this.ref.current);
        //console.log("hi from ", this);
    }

    render({ uistate }: IDropzonePaneProps): h.JSX.Element {
        console.log(uistate.moveableItems);

        return <div ref={this.ref}
            class="pane"
            onDrop={(e) => {
                e.preventDefault();
                const id = e.dataTransfer?.getData("text") || undefined;
                console.log(id);

                if (e.target) {
                    const elem = e.target as Element;
                    const boundingRect = elem.getBoundingClientRect();
                    /*
                    if (id !== undefined) {
                        const data = model.itemByID(id);
                        console.log(data);
                        if (data) 
                            uistate.moveableItems.register(new MoveableItem(data, e.clientX - boundingRect.left, e.clientY - boundingRect.top));
                    }
                    */
                }
            }}
            onDragOver={(e) => {
                e.preventDefault();
            }}
        >
            <div class="vertical-pane-group">
                <TwoJS noodles={uistate.edges} uistate={uistate}></TwoJS> 
                <div class="vertical-pane">
                    {
                       // uistate.moveableItems.registry.values.filter(e => (e.data.name !== "Delete")).map(e => (<Moveable item={e}><button class="btn btn-default">{e.data.name}</button></Moveable>))
                    }
                    <Moveable item={this.deleterBox}><div style={"width: 100; height:20; background-color: red;"}>
                        <button class="btn btn-negative" onClick={() => {
                        //    uistate.clearMoveableItems(this.deleter);
                        }}>DELETE</button>
                    </div>
                    </Moveable>

                    <Moveable item={this.deleter}><div style={"width: 100; height:20; background-color: red;"}>
                        <button class="btn btn-negative" onClick={() => {
                            //uistate.clearMoveableItems(this.deleter);
                        }}>DELETE</button>
                    </div>
                    </Moveable>
                </div>
                <div class="vertical-pane vertical-pane-sm sidebar">
                    <StoryComponentGallery></StoryComponentGallery>
                </div>
            </div>
        </div>
    }
}
