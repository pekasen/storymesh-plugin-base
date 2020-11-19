import { Component, h, RefObject } from 'preact';
import Two from 'twojs-ts';
import { MoveableItem } from "../store/MoveableItem";
import { EdgeItem } from '../store/EdgeItem';
import { UIStore } from '../store/UIStore';
import { StoryObjectView } from './StoryObjectViewRenderer/StoryObjectViewRenderer';
import { IEdge, IStoryObject } from 'storygraph';
import { Moveable } from './Moveable';
import { RootStore } from '../store/rootStore';
import { storeDecorator } from 'mobx/dist/internal';

interface ITwoJS {
    noodles?: IEdge[],
    uistate: UIStore//,
    //store: RootStore
  //  ref: RefObject<HTMLElement>
}

export class TwoJS {
    svg: Two;
    myCircles: Two.Circle[];
    noodles: IEdge[] | undefined;
    //myNoodles: EdgeItem[];
    x1: number; 
    y1: number;
    x2: number;
    y2: number;

    width = 8000;
    height = 6000;
    uistate: UIStore;
    constructor(props: ITwoJS) {
        this.x1 = 150;
        this.y1 = 150;
        this.x2 = 500;
        this.y2 = 500;
        this.svg = new Two({
            width: this.width,
            height: this.height,
            type: Two.Types.svg,
            fullscreen: false,
            autostart: true
        });
        this.noodles = props.noodles;
        this.uistate = props.uistate;
        this.store = props.store;
        
        this.myCircles = [];
        this.noodles?.map(e => {
            const movableItemFrom = this.uistate.moveableItems.registry.get(e.from);
            const movableItemTo = this.uistate.moveableItems.registry.get(e.to);
            
            if (movableItemFrom && movableItemTo) {
                return new EdgeItem({
                    from: movableItemFrom,
                    to: movableItemTo, 
                    id: e.id,
                    line: this.drawNoodleCurve(movableItemFrom.x, movableItemFrom.y, movableItemTo.x, movableItemTo.y)
                }) 
            }
            else return undefined;
        });
        // this.myCircles.push(this.drawCircle(this.x1, this.y1, 5));
        // this.myCircles.push(this.drawCircle(this.x2, this.y2, 5));
        // this.myNoodles.push(this.drawNoodleCurve(this.x1, this.y1, this.x2, this.y2));
        
        /* 
        this.myNoodles.forEach(edge => { 
            edge.center();
            const _arr = [edge.beginning, edge.ending];
            edge.vertices.forEach((v, i) => {               
                v.x = v.x + 125;
                v.y = v.y + 125;
                console.log("Verts: ", v.x, v.y);
            })
        */
    }

    updateMyCircles(moveableItems: MoveableItem[]): void {
      /*  if (this.myCircles.length === moveableItems.length) {
            this.myCircles.map((e, i) => {
                const root = moveableItems[i];                
                e.translation = new Two.Vector(
                    root.x,
                    root.y
                );
            });
        } else {*/
            this.svg.clear();
            this.myCircles = moveableItems.map(e => {
                return this.drawCircle(e.x, e.y, 50);
            });
      //  }
        this.svg.update();
    }
    
    public updateMyNoodles(noodles: IEdge[] | undefined): void {       
        this.noodles = noodles;
        console.log("Noodles", noodles);
        //this.drawNoodleCurve(100, 100, 300, 500);
        this.noodles?.map(e => {
            const movableItemFrom = this.uistate.moveableItems.getValue(e.from);
           // store.storyContentObjectRegistry.getValue(StoryGraph.parseNodeId(edge.from)[0]
            const movableItemTo = this.uistate.moveableItems.getValue(e.to);
            console.log("Movable Items", this.uistate.moveableItems.registry.get(e.from), this.uistate.moveableItems.registry.get(e.to));
            if (movableItemFrom && movableItemTo) {
                return new EdgeItem({
                    from: movableItemFrom,
                    to: movableItemTo, 
                    id: e.id,
                    line: this.drawNoodleCurve(movableItemFrom.x, movableItemFrom.y, movableItemTo.x, movableItemTo.y)
                }) 
            }
            else return undefined;
        });

        this.noodles?.forEach((e) => {
            if (e) {
                const elem = document.getElementById(e.id);
                elem?.addEventListener('click', () => {
                    console.log(elem);
                })
            }            
        });

        

        /*if (this.noodles.length !== moveableItems.length) {
            this.svg.clear();
            this.noodles = moveableItems
            .map((node1) => {
                return moveableItems.map(node2 => {
                    if (node1 !== node2) {
                        return {
                            from: node1,
                            to: node2, 
                            id: "meme",
                            line: this.drawNoodleCurve(node1.x, node1.y, node2.x, node2.y)
                        } as EdgeItem
                    }
                });
            }).reduce((p, c) => (
                [...p, ...c].filter(e => e !== undefined)
            )) as EdgeItem[];
        } else this.noodles.forEach(edge => {
            const _arr = [edge.from, edge.to];
            edge.line.vertices.forEach((v, i) => {
                v.x = _arr[i].x;
                v.y = _arr[i].y;
            })
        })

       
        this.myNoodles = moveableItems
            .map((node1) => {
                return moveableItems.map(node2 => {
                    if (node1 !== node2) {
                        return {
                            from: node1,
                            to: node2, 
                            id: "meme",
                            line: this.drawNoodleCurve(node1.x, node1.y, node2.x, node2.y)
                        } as EdgeItem
                    }
                });
            }).reduce((p, c) => (
                [...p, ...c].filter(e => e !== undefined)
            )) as EdgeItem[];*/
    }
    
    updateNoodle(nudel: Two.Path, x: number, y: number): void {
        nudel.vertices[1].x = x;
        nudel.vertices[1].y = y;
    }
    
    componentDidMount(): void {
        this.svg.appendTo(document.getElementById("hello-world") as HTMLElement);
        this.myCircles.forEach((e: Two.Circle) => {
            const elem = document.getElementById(e.id);
            elem?.addEventListener('mousedown', (me) => console.log("Say Hello from " + me.clientX, e.vertices[0].y, e.vertices[1].x, e.vertices[1].y));
        })

       /* this.myNoodles.forEach((e: EdgeItem) => {
            const elem = document.getElementById(e.id);
            elem?.addEventListener('click', () => {
                console.log(elem);
            })
        }) */
    }

    
    drawCircle(x: number, y: number, r: number): Two.Circle {
        const c = this.svg.makeCircle(x, y, r)
        c.fill = this.getRandomColor();   
        this.svg.update();
        return c;
    }

    drawRectangle(x1: number, y1: number, x2: number, y2: number): Two.Rectangl {
        const rect = this.svg.makeRectangle(x1, y1, x2, y2);
        rect.fill = "orange";
        rect.opacity = 0.25;
        rect.noStroke();        
        this.svg.update();
        return rect;
    }

    drawNoodleCurve(x1: number, y1: number, x2: number, y2: number): Two.Path {  
        const c = this.svg.makeCurve(x1, y1, x1 + 100, y1, x2 - 100, y2, x2, y2, true);
        c.linewidth = 5;
        c.stroke
        c.cap = "round";
        c.noFill();
        this.svg.update();
        return c;
    }
    
    redrawNoodleCurve(c: Two.Path, x1: number, y1: number, x2: number, y2: number): void { 
        c.vertices[0].x = x1;
        c.vertices[0].y = y1;
        c.vertices[1].x = x2;
        c.vertices[1].y = y2;
/*
        c.vertices.forEach((v, i) => {
            v.x = _arr[i].x;
            v.y = _arr[i].y;
        })
        */
    }

    getRandomColor(): string {
        return 'rgb('
          + Math.floor(Math.random() * 255) + ','
          + Math.floor(Math.random() * 255) + ','
          + Math.floor(Math.random() * 255) + ')';
      }

}
