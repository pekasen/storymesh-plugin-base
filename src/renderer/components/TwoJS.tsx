import { Component, h } from 'preact';
import Two from 'twojs-ts';
import { MoveableItem } from "../store/MoveableItem";
import { EdgeItem } from '../store/EdgeItem';

interface ITwoJS {
    noodles: EdgeItem[]
}

export class TwoJS extends Component<ITwoJS> {
    svg: Two;
    myCircles: Two.Circle[];
    noodles: EdgeItem[];

    constructor(props: ITwoJS) {
        super();
        this.svg = new Two({
            type: Two.Types.svg,
            fullscreen: false,
            autostart: true
        });

        this.noodles = props.noodles;
        this.myCircles = [1,2,2,1,2,2,42,1,1]
        .map(() => ({
            x: Math.random() * 640,
            y: Math.random() * 480
        })).map(e =>
            this.drawCircle(e.x, e.y, 50)
        );
    }

    drawCircle(x: number, y: number, r: number): Two.Circle {
        const c = this.svg.makeCircle(x, y, r)
        c.fill = this.getRandomColor();   
        this.svg.update();
        return c;
    }

    updateMyCircles(moveableItems: MoveableItem[]): void {
        if (this.myCircles.length === moveableItems.length) {
            this.myCircles.map((e, i) => {
                const root = moveableItems[i];                
                e.translation = new Two.Vector(
                    root.x,
                    root.y
                );
            });
        } else {
            this.svg.clear();
            this.myCircles = moveableItems.map(e => {
                return this.drawCircle(e.x, e.y, 50);
            });
        }
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
                            a: node1,
                            b: node2//,
//line: this.drawNoodleCurve(node1.x, node1.y, node2.x, node2.y)
                        } as EdgeItem
                    }
                });
            }).reduce((p, c) => (
                [...p, ...c].filter(e => e !== undefined)
            )) as EdgeItem[];
        } else this.noodles.forEach(edge => {
            const _arr = [edge.a, edge.b];
          //  edge.line.vertices.forEach((v, i) => {
          //      v.x = _arr[i].x;
         //       v.y = _arr[i].y;
          //  })
        })
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
        console.log("hi from "); 
        this.myCircles.forEach((e: Two.Circle) => {
            const elem = document.getElementById(e.id);
            elem?.addEventListener('click', () => console.log("Say Hello from " + e.id))
        })
    }

    drawNoodleCurve(x1: number, y1: number, x2: number, y2: number): Two.Path {
        return this.svg.makeCurve([x1, y1, x2, y2], true);
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
