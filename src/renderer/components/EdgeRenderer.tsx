import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useContext } from 'preact/hooks';
import { IStoryObject, StoryGraph } from 'storygraph';
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

        this.edgeRendererID = "edge-renderer";
        let nestedDisposeReaction: IReactionDisposer;
        

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
                        // console.log("EdgeRenderer", this.store.uistate.moveableItems);
                        this.reactToChanges(loadedObject);
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
                this.reactToChanges(loadedObject); 
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
                this.reactToChanges(loadedObject); 
            }
        );
    }

    reactToChanges(loadedObject: AbstractStoryObject): void {
        loadedObject.childNetwork?.edges.forEach(edge => {
            if (edge && edge.from && edge.to) {
                let twoPath = this.edges.get(edge.id);
                // TODO: replace setTimeout with something that makes more sense
                setTimeout(() => {
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
                }, 100);                                                
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
        if (obj)
            this.two.appendTo(obj);
    }

    drawEdgeCurve(x1: number, y1: number, x2: number, y2: number): Two.Path {
        const c = this.two.makeCurve(x1, y1, x1 - 50, y1 + 50, x2 + 50, y2 - 50, x2, y2, true);
        c.linewidth = 1;
        c.cap = "round";
        c.noFill();
        //c.translation.set(0, 0);
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

    render(): h.JSX.Element {
        return <div id={this.edgeRendererID}></div>
    }
}
