import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useContext } from 'preact/hooks';
import { IStoryObject } from 'storygraph';
import { Store } from '../..';
import { AbstractStoryObject } from '../../../plugins/helpers/AbstractStoryObject';
import { MoveableItem } from '../../store/MoveableItem';
import { Line, Rect, Svg, SVG } from '@svgdotjs/svg.js';

export interface IEdgeRendererProperties {
    loadedObject: IStoryObject
}

export class EdgeRenderer extends Component {
    edgeRendererID!: "edge-renderer";
    disposeReaction: IReactionDisposer;
    edges: Map<string, Line[]>;
    store = useContext(Store);
    disposeReactionLoadedItem: IReactionDisposer;
    mutationObserver: MutationObserver | undefined;
    mutationTargetNode: HTMLElement | undefined;
    mutationsConfig: MutationObserverInit;            
    looseNoodle?: Line[];
    selectionRectangle?: Rect;
    svg: Svg;

    constructor() {
        super();
        this.svg = SVG();
        this.edges = new Map();
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
        
        this.disposeReactionLoadedItem = reaction(
            () => (this.store.uistate.loadedItem),
            () => {
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
            document.addEventListener("drag", mouseMove);
            
            const dragEnd = () => {
                if (this.looseNoodle) {
                    this.deleteNoodle(this.looseNoodle);
                }
                document.removeEventListener("drag", mouseMove);
                // document.removeEventListener("dragend", dragEnd);
            }

            document.addEventListener("dragend", dragEnd);
        });

        document.addEventListener("SelectionDragStart", (customEvent: Event) => {            
            const e = customEvent as CustomEvent;            
            console.log("SelectionDragStart", e.detail.x, e.detail.y);   

            const mouseMove = (ev: MouseEvent) => 
            {
                this.drawSelectionRectangle(e.detail.x, e.detail.y, ev.clientX, ev.clientY);               
            }
            document.addEventListener("mousemove", mouseMove);
            
            const mouseUp = () => {
                //this.store.uistate.selectedItems.setSelectedItems();
                this.deleteRectangle(this.selectionRectangle);
                document.removeEventListener("mousemove", mouseMove);
                // document.removeEventListener("dragend", dragEnd);
            }

            document.addEventListener("mouseup", mouseUp);
        });
    }

    drawLooseNoodle(x: number, y: number, mouseX: number, mouseY: number): void {
        if (this.looseNoodle && this.looseNoodle.length > 0) {                                    
            this.redrawEdgeCurve(this.looseNoodle, x, y, mouseX, mouseY);
        } else {
            this.looseNoodle = this.drawEdgeCurve(x, y, mouseX, mouseY);           
        }
    }    

    deleteNoodle(noodle: Line[] | undefined): void {
        console.log("tryna delete", noodle);
        if (noodle) {            
            //const elem = noodle[0].element;
            //const elem2 = document.getElementById(noodle[1].id);
           // elem?.remove();
            //elem2?.remove();
            noodle[0].remove();
            noodle[1].remove();
            noodle.length = 0;
        }        
    }

    deleteRectangle(rect: Rect | undefined): void {
        if (rect) {
        //    rect.remove();
         //   rect = undefined;
            console.log("tryna delete", rect);
        }        
    }

    executeChangesToEdges(loadedObject: AbstractStoryObject): void {        
        loadedObject.childNetwork?.edges.forEach(edge => {
            if (edge && edge.from && edge.to) {
                let edgeLine = this.edges.get(edge.id);               
                const connFrom = document.getElementById(edge.from);
                const connTo = document.getElementById(edge.to);
                if (connFrom && connTo) {
                    const posFrom = connFrom.getBoundingClientRect();
                    const posTo = connTo.getBoundingClientRect();
                    if (edgeLine) {                                    
                        this.redrawEdgeCurve(edgeLine, posFrom.x + posFrom.width/2, posFrom.y + posFrom.height/2, posTo.x + posTo.width/2, posTo.y + posTo.height/2);
                    } else {
                        edgeLine = this.drawEdgeCurve(posFrom.x + posFrom.width/2, posFrom.y + posFrom.height/2, posTo.x + posTo.width/2, posTo.y + posTo.height/2);
                        this.edges.set(edge.id, edgeLine);
                        if (edgeLine && edgeLine.length > 1) {                             
                            const selectedItems = this.store.uistate.selectedItems;

                            edgeLine[0].click((e: MouseEvent) => {                               
                                if (e.shiftKey) {
                                   selectedItems.addToSelectedItems(edge.id);
                                } else {
                                   this.removeClassFromAllEdges(loadedObject, "selected");                                   
                                   selectedItems.setSelectedItems([edge.id]);
                                }
                                edgeLine[0].addClass("selected");
                                console.log("Clicked on", this.store.uistate.selectedItems);
                            });
                            
                            edgeLine[1].click((e: MouseEvent) => {
                                if (e.shiftKey) {
                                selectedItems.addToSelectedItems(edge.id);
                                } else {
                                    this.removeClassFromAllEdges(loadedObject, "selected");                                   
                                    selectedItems.setSelectedItems([edge.id]);
                                }
                                edgeLine[0].addClass("selected");
                                console.log("Clicked on", this.store.uistate.selectedItems);
                            })                            
                        }
                    }
                }  else {                               
                    this.deleteNoodle(edgeLine);
                    this.edges.delete(edge.id);
                }                                             
            }
        });
    }

    removeClassFromAllEdges(loadedObject: AbstractStoryObject, className: string): void {
        loadedObject.childNetwork?.edges.forEach(edge => {
            if (edge && edge.from && edge.to) {
                const edgeLine = this.edges.get(edge.id);    
                if (edgeLine) {
                    edgeLine[0].removeClass(className);
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
        if (obj) {
            this.svg = SVG().addTo(obj).size(1000, 1000);
        }
    }

    componentWillUnmount(): void {
        this.mutationObserver?.disconnect();
    }

    drawEdgeCurve(x1: number, y1: number, x2: number, y2: number): Line[] {
        // console.log("mutationTargetNode: ", this.mutationTargetNode);
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        //  console.log("drag mousemove", coords1, coords2);
        const c = this.svg.line(coords1.x, coords1.y, coords2.x, coords2.y);
        c.stroke({ color: '#f06', width: 10, linecap: 'round' });   
        const c2 = this.svg.line(coords1.x, coords1.y, coords2.x, coords2.y);
        c2.stroke({ color: 'transparent', width: 30, linecap: 'round' });

        return [c, c2];
    }

    drawSelectionRectangle(x1: number, y1: number, x2: number, y2: number): void {
        //console.log(x1, y1, x2, y2);
        if (this.selectionRectangle) {
            this.redrawRectangle(this.selectionRectangle, x1, y1, x2, y2);
        } else {
            this.selectionRectangle = this.drawRectangle(x1, y1, x2, y2);
        }
    }

    drawRectangle(x1: number, y1: number, x2: number, y2: number): Rect {
        //console.log("mutationTargetNode: ", this.mutationTargetNode);
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        console.log("drawRectangle", coords1, coords2);
        const width = Math.abs(coords2.x - coords1.x);
        const height = Math.abs(coords2.y - coords1.y);
        const posX = coords1.x + (coords2.x - coords1.x) / 2;
        const posY = coords1.y + (coords2.y - coords1.y) / 2;
        const rect = this.svg.rect(width, height);
        rect.fill('#f06').move(posX, posY);
        
        return rect;
    }

    redrawRectangle(rect: Rect, x1: number, y1: number, x2: number, y2: number): void { 
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        console.log("redrawRectangle", coords1, coords2);
        const posX = coords1.x + (coords2.x - coords1.x) / 2;
        const posY = coords1.y + (coords2.y - coords1.y) / 2;   
        const width = Math.abs(coords2.x - coords1.x);
        const height = Math.abs(coords2.y - coords1.y);       
        rect.width(width);
        rect.height(height);
        rect.move(posX, posY);
    }


    redrawEdgeCurve(paths: Line[], x1: number, y1: number, x2: number, y2: number): void {      
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        paths[0].plot(coords1.x, coords1.y, coords2.x, coords2.y);
        paths[1].plot(coords1.x, coords1.y, coords2.x, coords2.y);
    }

    render(): h.JSX.Element {
        return <div id={this.edgeRendererID}
            onMouseDown = {(ev: MouseEvent) => {
                // create and dispatch the event
                const event = new CustomEvent("SelectionDragStart", {
                    detail: {
                        x: ev.clientX,
                        y: ev.clientY
                    }
                });
                document.dispatchEvent(event);
            }  
        }></div>
    }
}
