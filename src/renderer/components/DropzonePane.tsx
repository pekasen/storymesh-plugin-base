import { reaction } from 'mobx';
import { Component, createRef, h } from "preact";

import Two from 'twojs-ts';
import { UIStore } from "../store/UIStore";

import { Moveable } from './Moveable';
import { MoveableItem } from "../store/MoveableItem";
import { List } from '../store/List';
import { ListItem } from '../store/ListItem';
import { StoryComponentGallery } from './StoryComponentGalleryView/StoryComponentGallery';

interface IDropzonePaneProps {
    uistate: UIStore
    model: List
}

interface IEdge {
    a: MoveableItem
    b: MoveableItem
    line: Two.Line
}

export class DropzonePane extends Component<IDropzonePaneProps> {

    two: Two;
    myCircles: Two.Circle[]
    myNoodles: IEdge[]
    ref = createRef();
    deleter = new MoveableItem(new ListItem("Delete", "DELETER"), 0, 0);
    
    constructor(props: IDropzonePaneProps) {
        super(props);
        this.two = new Two({
            type: Two.Types.canvas,
            fullscreen: false
        });
        this.myCircles = this.props.uistate.moveableItems.map(e =>
            this.two.makeCircle(e.x, e.y, 50)
        );
        this.myNoodles = [];
        

        props.uistate.appendMoveableItem(this.deleter);

        reaction(
            () => (props.uistate.moveableItems),
            () => {
                this.setState({});
            }
        );

        reaction(
            () => (props.uistate.moveableItems.map(e => {e.x,  e.y})),
            () => {
                this.updateMyCircles();
                this.updateMyNoodles();
            }
        )
    }
    
    componentDidMount(): void {
        // const two = this.two;

        // const circle = two.makeCircle(72, 100, 50);
        // const rect = two.makeRectangle(413, 100, 100, 100);      
        
        // circle.fill = '#FF8000';
        // circle.stroke = 'orangered'; 
        // circle.linewidth = 5;
        
        // rect.fill = 'rgb(0, 200, 255)';
        // rect.opacity = 0.75;
        // rect.noStroke();

        this.two.appendTo(this.ref.current).update();
    }

    updateMyCircles(): void {
        if (this.myCircles.length === this.props.uistate.moveableItems.length) {
            this.myCircles.map((e, i) => {
                const root = this.props.uistate.moveableItems[i];
                
                e.translation = new Two.Vector(
                    root.x,
                    root.y
                );
            });
        } else {
            this.two.clear();
            this.myCircles = this.props.uistate.moveableItems.map(e => this.two.makeCircle(e.x, e.y, 50))
        }
        this.two.update();
    }

    updateMyNoodles(): void {
        // generate
        if (this.myNoodles.length !== this.props.uistate.moveableItems.length) {
            this.two.clear();
            this.myNoodles = this.props.uistate.moveableItems
            .map((node1) => {
                return this.props.uistate.moveableItems.map(node2 => {
                    if (node1 !== node2) {
                        return {
                            a: node1,
                            b: node2,
                            line: this.two.makeLine(node1.x, node1.y, node2.x, node2.y)
                        } as IEdge
                    }
                });
            }).reduce((p, c) => (
                [...p, ...c].filter(e => e !== undefined)
            )) as IEdge[];
        } else this.myNoodles.forEach(edge => {
            const _arr = [edge.a, edge.b];
            edge.line.vertices.forEach((v, i) => {
                v.x = _arr[i].x;
                v.y = _arr[i].y;
            })
        })
    }

    render({ uistate, model }: IDropzonePaneProps): h.JSX.Element {
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
            <div class="vertical-pane-group">
                <div class="vertical-pane">
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
                <div class="vertical-pane vertical-pane-sm sidebar">
                    <StoryComponentGallery></StoryComponentGallery>
                </div>
            </div>
        </div>
    }
}
