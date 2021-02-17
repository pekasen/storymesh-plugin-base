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
    disposeReactionSelectedEdges: IReactionDisposer;
    disposeReactionCollapseItem: IReactionDisposer;
    mutationObserver_LoadedItem: MutationObserver | undefined;
    mutationObserver_CollapseItem: MutationObserver | undefined;
    mutationTargetNode: HTMLElement | undefined;
    mutationsConfig_LoadedItem: MutationObserverInit;            
    mutationsConfig_CollapseItem: MutationObserverInit;            
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
        this.mutationsConfig_LoadedItem = { subtree: true, attributeFilter: [ "id" ] };
        this.mutationsConfig_CollapseItem = { subtree: true, attributeFilter: [ "class" ] };

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
                        //this.clearEdges();
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
                this.setState({});
                
                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");
                
                // Callback function to execute when mutations are observed
                const callback = (() => {
                    this.executeChangesToEdges(loadedObject);
                });

                // Create an observer instance linked to the callback function
                this.mutationObserver_LoadedItem = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                this.mutationObserver_LoadedItem.observe(this.mutationTargetNode as Node, this.mutationsConfig_LoadedItem);                
            }
        );

        this.disposeReactionCollapseItem = reaction(
            () => {
                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");
                const moveableItems = loadedObject?.childNetwork?.nodes.map((id) => {                    
                    return this.store.uistate.moveableItems.getValue(id);
                }).filter(e => e != undefined) as MoveableItem[];    

               return [...moveableItems.map(e => e.collapsed)]},
            () => {
                this.setState({});
                
                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");
                
                // Callback function to execute when mutations are observed
                const callback = (() => {
                    this.executeChangesToEdges(loadedObject);
                });

                // Create an observer instance linked to the callback function
                this.mutationObserver_CollapseItem = new MutationObserver(callback);

                // Start observing the target node for configured mutations
                this.mutationObserver_CollapseItem.observe(this.mutationTargetNode as Node, this.mutationsConfig_CollapseItem);                
            }
        );

        this.disposeReactionSelectedEdges = reaction(
            () => ([this.store.uistate.selectedItems.ids, this.store.uistate.selectedItems.ids.length]),
            () => {  
                this.setState({});
                //console.log("selected items changed", this.store.uistate.selectedItems.ids.length);
                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");

                this.removeClassFromAllEdges(loadedObject, "selected");    
                loadedObject.childNetwork?.edges.forEach(edge => {
                    if (edge && edge.from && edge.to) {
                        const edgeLine = this.edges.get(edge.id);  
                        const edgeFound = this.store.uistate.selectedItems.ids.find((id) => id == edge.id);
                        //console.log(edgeFound);
                        if (edgeFound && edgeLine)  {
                            edgeLine[0].addClass("selected");
                           // console.log("edge selected");
                        }
                    }
                });
            }
        );

        document.addEventListener("ConnectorDragStart", (customEvent: Event) => {
            //console.log("ConnectorDragStart");
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
            }

            document.addEventListener("dragend", dragEnd);
        });

        document.addEventListener("SelectionDragStart", (customEvent: Event) => {            
            const e = customEvent as CustomEvent;            
            //console.log("SelectionDragStart", e.detail.x, e.detail.y);   

            const mouseMove = (ev: MouseEvent) => 
            {
                this.drawSelectionRectangle(e.detail.x, e.detail.y, ev.clientX, ev.clientY);               
            }
            document.addEventListener("mousemove", mouseMove);
            
            const mouseUp = () => {
                document.removeEventListener("mousemove", mouseMove);
                this.store.uistate.selectedItems.clearSelectedItems();

                const loadedObject = this.store.storyContentObjectRegistry.getValue(this.store.uistate.loadedItem);
                if (!loadedObject)
                    throw ("Undefined loaded object");
                const moveableItems = loadedObject?.childNetwork?.nodes.map((id) => {                    
                    return this.store.uistate.moveableItems.getValue(id);
                }).filter(e => e != undefined) as MoveableItem[];  
                
                moveableItems.map((movItem: MoveableItem) => {       
                    let item;
                    if (movItem && movItem.id) {
                        item = document.getElementById(movItem?.id);
                        if (item && this.selectionRectangle && this.selectorIsOverlapping(item, this.selectionRectangle))
                        {
                            this.store.uistate.selectedItems.addToSelectedItems(movItem.id);
                        }
                    }
                });
                this.deleteRect();
                document.removeEventListener("mouseup", mouseUp);
            }

            document.addEventListener("mouseup", mouseUp);
        });
    }

    deleteRect(): void {
        this.selectionRectangle?.remove();
        this.selectionRectangle = undefined;
    }

    drawLooseNoodle(x: number, y: number, mouseX: number, mouseY: number): void {
        if (this.looseNoodle && this.looseNoodle.length > 1) {                                    
            this.redrawEdgeCurve(this.looseNoodle, x, y, mouseX, mouseY);
        } else {
            this.looseNoodle = this.drawEdgeCurve(x, y, mouseX, mouseY);           
        }
    }    

    deleteNoodle(noodle: Line[] | undefined): void {
        if (noodle) {
            noodle.forEach(e => e.remove());
            noodle.length = 0;
        }        
    }

    executeChangesToEdges(loadedObject: AbstractStoryObject): void {        
        this.clearEdges();     
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
                             edgeLine[0].click((e: MouseEvent) => {
                                if (e.shiftKey) {
                                    this.store.uistate.selectedItems.addToSelectedItems(edge.id);
                                } else {
                                    this.store.uistate.selectedItems.setSelectedItems([edge.id]);
                                }
                            }); 
                            
                            edgeLine[1].click((e: MouseEvent) => {
                                if (e.shiftKey) {
                                    this.store.uistate.selectedItems.addToSelectedItems(edge.id);
                                } else {                              
                                    this.store.uistate.selectedItems.setSelectedItems([edge.id]);
                                }
                            });
                        }
                    }
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

    clearEdges(): void {
        this.edges.forEach(e => e.forEach(f => f.remove()));
        this.edges.clear();
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
        this.mutationTargetNode = document.getElementById('node-editor') as HTMLElement;
        if (obj) {
            this.svg = SVG().addTo(obj).size(1000, 1000);
        }
    }

    componentWillUnmount(): void {
        this.mutationObserver_CollapseItem?.disconnect();
        this.mutationObserver_LoadedItem?.disconnect();
    }

    drawEdgeCurve(x1: number, y1: number, x2: number, y2: number): Line[] {
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        const c = this.svg.line(coords1.x, coords1.y, coords2.x, coords2.y);
        c.stroke({ color: '#f06', linecap: 'round' });   
        const c2 = this.svg.line(coords1.x, coords1.y, coords2.x, coords2.y);
        c2.stroke({ color: 'transparent', width: 30, linecap: 'round' });

        return [c, c2];
    }

    drawSelectionRectangle(x1: number, y1: number, x2: number, y2: number): void {  
        if (this.selectionRectangle) {
            this.redrawRectangle(this.selectionRectangle, x1, y1, x2, y2);
        } else {
            this.selectionRectangle = this.drawRectangle(x1, y1, x2, y2);
        }
    }

    drawRectangle(x1: number, y1: number, x2: number, y2: number): Rect {
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2);
        const width = Math.abs(coords2.x - coords1.x);
        const height = Math.abs(coords2.y - coords1.y);
        const posX = Math.min(coords1.x, coords2.x);
        const posY = Math.min(coords1.y, coords2.y);
        const rect = this.svg.rect(width, height);
        rect.fill('rgba(255,255,255,0.3)').stroke('#efefef').move(posX, posY);        
        return rect;
    }

    redrawRectangle(rect: Rect, x1: number, y1: number, x2: number, y2: number): void { 
        const coords1 = this.getAbsPosOffset(x1, y1);
        const coords2 = this.getAbsPosOffset(x2, y2); 
        const width = Math.abs(coords2.x - coords1.x);
        const height = Math.abs(coords2.y - coords1.y);     
        const posX = Math.min(coords1.x, coords2.x);
        const posY = Math.min(coords1.y, coords2.y);    
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

    selectorIsOverlapping( elem: HTMLElement, selectionRect: Rect ) : boolean {
        const d1_offset             = this.getAbsPosOffset(elem.getBoundingClientRect().x, elem.getBoundingClientRect().y);
        const d1_height             = elem.getBoundingClientRect().height;
        const d1_width              = elem.getBoundingClientRect().width;
        const d1_distance_from_top  = d1_offset.y + d1_height;
        const d1_distance_from_left = d1_offset.x + d1_width;
    
        const d2_offset_x             = selectionRect.x();
        const d2_offset_y             = selectionRect.y();
        const d2_height             = selectionRect.height();
        const d2_width              = selectionRect.width();
        const d2_distance_from_top  = d2_offset_y + d2_height;
        const d2_distance_from_left = d2_offset_x + d2_width;
        
        const not_colliding = ( d1_distance_from_top < d2_offset_y 
            || d1_offset.y > d2_distance_from_top 
            || d1_distance_from_left < d2_offset_x 
            || d1_offset.x > d2_distance_from_left );
    
        return !not_colliding;
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
