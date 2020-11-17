import { Component, h } from 'preact';
import Two from 'twojs-ts';
import { MoveableItem } from "../store/MoveableItem";
import { EdgeItem } from '../store/EdgeItem';
import { UIStore } from '../store/UIStore';

interface ITwoJS {
    noodles: EdgeItem[],
    uistate: UIStore 
}

export class TwoJS extends Component<ITwoJS> {
    svg: Two;
    myCircles: Two.Circle[];
    noodles: EdgeItem[];
    myNoodles: Two.Path[];
    x1: number; 
    y1: number;
    x2: number;
    y2: number;

    width = 800;
    height = 600;

    constructor(props: ITwoJS) {
        super();
        this.x1 = 50;
        this.y1 = 50;
        this.x2 = 200;
        this.y2 = 200;
        this.svg = new Two({
            width: this.width,
            height: this.height,
            type: Two.Types.svg,
            fullscreen: false,
            autostart: true
        });

        this.noodles = props.noodles;
        /*this.noodles.map(e =>
            //this.drawNoodleCurve(e.from.x, e.from.y, e.b.x, e.b.y)
            this.drawNoodleCurve(1, 1, 1000, 1000)
        );*/

        this.myCircles = [];
        this.myNoodles = [];
        this.myCircles.push(this.drawCircle(this.x1, this.y1, 5));
        this.myCircles.push(this.drawCircle(this.x2, this.y2, 5));
        this.myNoodles.push(this.drawNoodleCurve(this.x1, this.y1, this.x2, this.y2));
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
    
    updateMyNoodles(moveableItems: MoveableItem[]): void {
        if (this.noodles.length !== moveableItems.length) {
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
    }
    
    updateNoodle(nudel: Two.Path, x: number, y: number): void {
        nudel.vertices[1].x = x;
        nudel.vertices[1].y = y;
    }
    
    componentDidMount(): void {
        this.svg.appendTo(document.getElementsByClassName("vertical-pane")[0] as HTMLElement);
        // const two = this.two;
        // const circle = two.makeCircle(72, 100, 50);
        // const rect = two.makeRectangle(413, 100, 100, 100);      
        
        // circle.fill = '#FF8000';
        // circle.stroke = 'orangered'; 
        // circle.linewidth = 5;
        
        // rect.fill = 'rgb(0, 200, 255)';
        // rect.opacity = 0.75;
        // rect.noStroke();
        //this.svg.update();
        this.myCircles.forEach((e: Two.Circle) => {
            const elem = document.getElementById(e.id);
            elem?.addEventListener('mousedown', (me) => console.log("Say Hello from " + me.clientX, e.vertices[0].y, e.vertices[1].x, e.vertices[1].y));
            //elem.ondrag((this, ev) => mouseenter);
        })

        this.myNoodles.forEach((e: Two.Path) => {
            const elem = document.getElementById(e.id);
            elem?.addEventListener('click', () => {
                console.log(elem);
            })
        })
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
        /*const curve = this.svg.makeCurve(110, 100, 120, 50, 140, 150, 160, 50, 180, 150, 190, 100, true);
        curve.linewidth = 2;
        curve.scale = 1.75;
        curve.rotation = Math.PI / 2; // Quarter-turn
        curve.noFill();
        return curve;*/

        const c = this.svg.makeCurve([x1, y1, x2, y2], true);
    //    c.rotation = Math.PI / 4; // Quarter-turn
        c.linewidth = 5;
        c.cap = "round";
        c.noFill();
        this.svg.update();
        console.log(x1, y1, x2, y2, c.getBoundingClientRect());
        return c;
    }

    getRandomColor(): string {
        return 'rgb('
          + Math.floor(Math.random() * 255) + ','
          + Math.floor(Math.random() * 255) + ','
          + Math.floor(Math.random() * 255) + ')';
      }

      render():  h.JSX.Element {
          return <div></div>;
      }
}
