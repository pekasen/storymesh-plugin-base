import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useContext } from 'preact/hooks';
import { IStoryObject } from 'storygraph';
import Two from 'twojs-ts';
import { Store } from '../..';
import { AbstractStoryObject } from '../../../plugins/helpers/AbstractStoryObject';
import { MoveableItem } from '../../store/MoveableItem';

export interface IEdgeRendererProperties {
    loadedObject: IStoryObject
}

export class EdgeRenderer extends Component {
    edgeRendererID!: "edge-renderer";
    disposeReaction: IReactionDisposer;
    two: Two;
    edges: Map<string, Two.Path[]>;
    store = useContext(Store);
    disposeReaction2: IReactionDisposer;
    mutationObserver: MutationObserver | undefined;
    mutationTargetNode: HTMLElement | undefined;
    mutationsConfig: MutationObserverInit;            
    looseNoodle?: Two.Path[];

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
                const moveableItems = loadedObject?.childNetwork?.nodes.map((id) => {                    
                    return this.store.uistate.moveableItems.getValue(id);
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
                    this.executeChangesToEdges(loadedObject);
                });

                // Create an observer instance linked to the callback function
                this.mutationObserver = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                this.mutationObserver.observe(this.mutationTargetNode as Node, this.mutationsConfig);                
            }
        );

        document.addEventListener("ConnectorDragStart", (customEvent: Event) => {
            console.log("ConnectorDragStart");
            const e = customEvent as CustomEvent;
            const mouseMove = (ev: MouseEvent) => 
            { 
                this.drawLooseNoodle(e.detail.x, e.detail.y, ev.clientX, ev.clientY);               
            }
            window.addEventListener("drag", mouseMove);
            
            const dragEnd =  (ev: MouseEvent) => {
                if (this.looseNoodle) {
                    this.deleteNoodle(this.looseNoodle);
                }
                document.removeEventListener("drag", mouseMove);
                document.removeEventListener("dragend", dragEnd);
            }

            document.addEventListener("dragend", dragEnd);
        });
    }

    drawLooseNoodle(x: number, y: number, mouseX: number, mouseY: number): void {
        if (this.looseNoodle && this.looseNoodle.length > 0) {                                    
            this.redrawEdgeCurve(this.looseNoodle, x, y, mouseX, mouseY);
        } else {
            this.looseNoodle = this.drawEdgeCurve(x, y, mouseX, mouseY);           
        }
    }

    deleteNoodle(noodle: Two.Path[] | undefined): void {
        console.log("tryna delete", noodle);
        if (noodle) {            
            const elem = document.getElementById(noodle[0].id);
            const elem2 = document.getElementById(noodle[1].id);
            elem?.remove();
            elem2?.remove();
            noodle[0].remove();
            noodle[1].remove();
            noodle.length = 0;
        }        
    }

    executeChangesToEdges(loadedObject: AbstractStoryObject): void {        
        loadedObject.childNetwork?.edges.forEach(edge => {
            if (edge && edge.from && edge.to) {
                let twoPath = this.edges.get(edge.id);               
                const connFrom = document.getElementById(edge.from);
                const connTo = document.getElementById(edge.to);
                if (connFrom && connTo) {
                    const posFrom = connFrom.getBoundingClientRect();
                    const posTo = connTo.getBoundingClientRect();
                    if (twoPath) {                                    
                        this.redrawEdgeCurve(twoPath, posFrom.x + posFrom.width/2, posFrom.y + posFrom.height/2, posTo.x + posTo.width/2, posTo.y + posTo.height/2);
                    } else {
                        twoPath = this.drawEdgeCurve(posFrom.x + posFrom.width/2, posFrom.y + posFrom.height/2, posTo.x + posTo.width/2, posTo.y + posTo.height/2);
                        this.edges.set(edge.id, twoPath);
                        if (twoPath) {
                            const elem = document.getElementById(twoPath[0].id);
                            const elem2 = document.getElementById(twoPath[1].id);
                            const selectedItems = this.store.uistate.selectedItems;

                            elem?.addEventListener('click', (e) => {                               
                                if (e.shiftKey) {
                                   selectedItems.addToSelectedItems(edge.id);
                                } else {
                                   this.removeClassFromAllEdges(loadedObject, "selected");                                   
                                   selectedItems.setSelectedItems([edge.id]);
                                }
                                elem.classList.add("selected");
                                console.log("Clicked on", this.store.uistate.selectedItems);
                            });
                            
                            elem2?.addEventListener('click', (e) => {
                                if (e.shiftKey) {
                                selectedItems.addToSelectedItems(edge.id);
                                } else {
                                    this.removeClassFromAllEdges(loadedObject, "selected");                                   
                                    selectedItems.setSelectedItems([edge.id]);
                                }
                                elem?.classList.add("selected");
                                //    elem2.classList.add("selected");
                                console.log("Clicked on", this.store.uistate.selectedItems);
                            }
                            )                            
                        }
                    }
                }  else {                               
                    this.deleteNoodle(twoPath);
                    this.edges.delete(edge.id);
                }                                             
            }
            
            this.two.update();
        });
    }

    removeClassFromAllEdges(loadedObject: AbstractStoryObject, className: string): void {
        loadedObject.childNetwork?.edges.forEach(edge => {
            if (edge && edge.from && edge.to) {
                const twoPath2 = this.edges.get(edge.id);    
                if (twoPath2) {
                    document.getElementById(twoPath2[0].id)?.classList.remove(className);
                    //document.getElementById(twoPath2[1].id)?.classList.remove(className);
                }         
            }
        });
    }

    getOffset(x: number, y: number): {x: number, y: number} {
        const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft,
            scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        return { x: x + scrollLeft, y: y + scrollTop }
    }

    getAbsPosOffset(x: number, y: number): {x: number, y: number} {        
        if (this.mutationTargetNode) {
            const rendererRect = this.mutationTargetNode.getBoundingClientRect();
            const scrollLeft = this.mutationTargetNode?.scrollLeft || 0,
            scrollTop = this.mutationTargetNode?.scrollTop || 0;
            return {x: x - rendererRect.x + scrollLeft, y: y - rendererRect.y + scrollTop}; 
        } else return {x: x, y: y};        
    }

    getAbsolutePositionInRenderer(elem: HTMLElement): {x: number, y: number} {
        const elemRect = elem.getBoundingClientRect();
        if (this.mutationTargetNode) {
            const rendererRect = this.mutationTargetNode.getBoundingClientRect();            
            const scrollLeft = this.mutationTargetNode?.scrollLeft || 0,
            scrollTop = this.mutationTargetNode?.scrollTop || 0;
            return {x: elemRect.x - rendererRect.x + scrollLeft, y: elemRect.y - rendererRect.y + scrollTop};
        } else return {x: elemRect.x, y: elemRect.y}
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

    drawEdgeCurve(x1: number, y1: number, x2: number, y2: number): Two.Path[] {
        // console.log("mutationTargetNode: ", this.mutationTargetNode);
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        //  console.log("drag mousemove", coords1, coords2);
        const c = this.two.makeCurve(coords1.x, coords1.y, coords2.x, coords2.y, true);
        c.linewidth = 2;
        c.stroke = '#353535';
        c.cap = "round";
        c.noFill();
        const c2 = this.two.makeCurve(coords1.x, coords1.y, coords2.x, coords2.y, true);
        c2.linewidth = 20;
        c2.cap = "round";
        c2.stroke = "transparent";
        c2.noFill();
        // c.translation.set(0, 0);
        this.two.update();
        return [c, c2];
    }

    redrawEdgeCurve(paths: Two.Path[], x1: number, y1: number, x2: number, y2: number): void {      
        paths[0].translation.set(0, 0);
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        paths[0].vertices[0].x = coords1.x;
        paths[0].vertices[0].y = coords1.y;
        paths[0].vertices[1].x = coords2.x;
        paths[0].vertices[1].y = coords2.y;
        paths[1].translation.set(0, 0);
        paths[1].vertices[0].x = coords1.x;
        paths[1].vertices[0].y = coords1.y;
        paths[1].vertices[1].x = coords2.x;
        paths[1].vertices[1].y = coords2.y;
        /*
        c.vertices[1].x = x1 + 50;
        c.vertices[1].y = y1;
        c.vertices[2].x = x2 - 50;
        c.vertices[2].y = y2;
        c.vertices[3].x = x2;
        c.vertices[3].y = y2;
        */
    }

    /*
    redrawEdgeCurveFixedEnd(paths: Two.Path[], x: number, y: number): void {      
        paths[0].translation.set(0, 0);
        const coords = this.getAbsPosOffset(x, y);
        paths[0].vertices[1].x = coords.x;
        paths[0].vertices[1].y = coords.y;
        paths[1].translation.set(0, 0);
        paths[1].vertices[1].x = coords.x;
        paths[1].vertices[1].y = coords.y;        
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
