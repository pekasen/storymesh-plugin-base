import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useContext } from 'preact/hooks';
import { IStoryObject } from 'storygraph';
import Two from 'twojs-ts';
import { Store } from '..';
import { AbstractStoryObject } from '../../plugins/helpers/AbstractStoryObject';
import { MoveableItem } from '../store/MoveableItem';

export interface IEdgeRendererProperties {
    loadedObject: IStoryObject
}

export class EdgeRenderer extends Component {
    edgeRendererID!: "edge-renderer";
    disposeReaction: IReactionDisposer;
    two: Two;
    edges: Map<string, Two.Path>;
    store = useContext(Store);
    disposeReaction2: IReactionDisposer;
    disposeReaction3: IReactionDisposer;
    mutationObserver: MutationObserver | undefined;
    mutationTargetNode: HTMLElement | undefined;
    mutationsConfig: MutationObserverInit;            
    looseNoodle?: Two.Path;

    constructor() {
        super();
        this.edges = new Map();
        this.two = new Two({
            width: 1000,
            height: 1000,
            type: Two.Types.svg,
            fullscreen: false,
            autostart: true
        });

        this.mutationTargetNode = undefined;
        this.edgeRendererID = "edge-renderer";
        let nestedDisposeReaction: IReactionDisposer;
        // Options for the observer (which mutations to observe)
        this.mutationsConfig = { childList: true, subtree: true };

        this.disposeReaction = reaction(
            () => {
                if (nestedDisposeReaction) {
                    nestedDisposeReaction();
                }
                
                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");
                const moveableItems = loadedObject?.childNetwork?.nodes.map((node) => {                    
                    return this.store.uistate.moveableItems.getValue(node.id);
                }).filter(e => e != undefined) as MoveableItem[];    
                
                nestedDisposeReaction = reaction(
                    () => ([...moveableItems.map(e => e.x),
                    ...moveableItems.map(e => e.y)]),
                    () => {
                        this.setState({});
                        this.executeChangesToEdges(loadedObject);
                    }
                );
                
                return [
                    loadedObject?.childNetwork?.edges.length
                ]
            },
            () => {
                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");
                this.setState({});                
                this.executeChangesToEdges(loadedObject); 
            }
        )
        
        this.disposeReaction2 = reaction(
            () => (this.store.uistate.loadedItem),
            () => {
                this.two.clear();
                this.edges.clear();
                this.setState({});
                
                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");
                
                // Callback function to execute when mutations are observed
                const callback = (() => {
                    //(mutationsList: MutationRecord[]) => {
                    // Use traditional 'for loops' for IE 11
                    /*   for(const mutation of mutationsList) {
                        if (mutation.type === 'childList') {
                            console.log('hello-world: A child node has been added or removed.');
                        }
                        else if (mutation.type === 'attributes') {
                            console.log('hello-world: The ' + mutation.attributeName + ' attribute was modified.');
                        }
                    } */
                    this.executeChangesToEdges(loadedObject);
                });

                // Create an observer instance linked to the callback function
                this.mutationObserver = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                this.mutationObserver.observe(this.mutationTargetNode as Node, this.mutationsConfig);                
            }
        );

        document.addEventListener("ConnectorDragStart", (customEvent: Event) => {
            const e = customEvent as CustomEvent;
            document.addEventListener("mousemove", (ev) => 
            {
                this.drawLooseNoodle(e.detail.x, e.detail.y, ev.clientX, ev.clientY) 
            });
        });
    }

    drawLooseNoodle(x: number, y: number, mouseX: number, mouseY: number): void {
        if (this.looseNoodle) {                                    
            this.redrawEdgeCurveFixedEnd(this.looseNoodle, mouseX, mouseY);
        } else {
            this.looseNoodle = this.drawEdgeCurve(x, y, mouseX, mouseY);            
        }
    }

    executeChangesToEdges(loadedObject: AbstractStoryObject): void {        
        loadedObject.childNetwork?.edges.forEach(edge => {
            if (edge && edge.from && edge.to) {
                let twoPath = this.edges.get(edge.id);               
                const connFrom = document.getElementById(edge.from);
                const connTo = document.getElementById(edge.to);             
                if (connFrom && connTo) {
                    const posFrom = this.getChildOffset(connFrom);
                    const posTo = this.getChildOffset(connTo);
                    if (twoPath) {                                    
                        this.redrawEdgeCurve(twoPath, posFrom.x, posFrom.y, posTo.x, posTo.y);
                    } else {
                        twoPath = this.drawEdgeCurve(posFrom.x, posFrom.y, posTo.x, posTo.y);
                        this.edges.set(edge.id, twoPath);
                        if (twoPath) {
                            const elem = document.getElementById(twoPath.id);
                            elem?.addEventListener('click', () => {
                                console.log("Clicked on", twoPath?.id);
                            })
                        }
                    }
                }                                               
            }
        });
    }

    getChildOffset(el: HTMLElement): {x: number, y: number} {
        const rect = el.getBoundingClientRect();
        const parentRect = document.getElementById(this.edgeRendererID)?.getBoundingClientRect();
        if (parentRect)
            return {x: rect.left - parentRect.left + rect.width/2, y: rect.top - parentRect.top + rect.height/2}; 
        else 
            return {x: rect.left + rect.width/2, y:rect.top + rect.height/2};
    }

    componentDidMount(): void {
        const obj = document.getElementById(this.edgeRendererID);
        
                // Select the node that will be observed for mutations
                this.mutationTargetNode = document.getElementById('hello-world') as HTMLElement;
        if (obj)
            this.two.appendTo(obj);
    }

    componentWillUnmount(): void {
        this.mutationObserver?.disconnect();
    }

    drawEdgeCurve(x1: number, y1: number, x2: number, y2: number): Two.Path {
        const c = this.two.makeCurve(x1, y1, x1 - 50, y1 + 50, x2 + 50, y2 - 50, x2, y2, true);
        c.linewidth = 1;
        c.cap = "round";
        c.noFill();
        // c.translation.set(0, 0);
        this.two.update();
        return c;
    }

    redrawEdgeCurve(c: Two.Path, x1: number, y1: number, x2: number, y2: number): void {      
        c.translation.set(0, 0);
        c.vertices[0].x = x1;
        c.vertices[0].y = y1;
        c.vertices[1].x = x1 + 50;
        c.vertices[1].y = y1;
        c.vertices[2].x = x2 - 50;
        c.vertices[2].y = y2;
        c.vertices[3].x = x2;
        c.vertices[3].y = y2;
    }

    redrawEdgeCurveFixedEnd(c: Two.Path, x: number, y: number): void {      
        c.translation.set(0, 0);
        c.vertices[3].x = x;
        c.vertices[3].y = y;
    }

    /*
    avoidDOMElement(path1: Two.Path, elemClass: string): void {
        const path1Length = path1.getTotalLength();
        const elem = document.elementFromPoint(2, 2);
        if (elem?.classList.contains(elemClass)) {

        }
        
        const path2Points = [];
     
         for (let j = 0; j < path2Length; j++) {      
           path2Points.push(path2.getPointAtLength(j));
         }
      
      for (let i = 0; i < path1Length; i++) {  
        const point1 = path1.getPointAtLength(i);
    
        for (let j = 0; j < path2Points.length; j++) {
          if (pointIntersect(point1, path2Points[j])) {
            result.innerHTML = point1.x + ',' + point1.y + ' ' + path2Points[j].x + ',' + path2Points[j].y;
            return;
          }
        }
      }
    }
    */



    render(): h.JSX.Element {
        return <div id={this.edgeRendererID}></div>
    }
}
