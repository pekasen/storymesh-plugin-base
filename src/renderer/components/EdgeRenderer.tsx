import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useContext } from 'preact/hooks';
import { IEdge, IStoryObject, StoryGraph } from 'storygraph';
import Two from 'twojs-ts';
import { Store } from '..';
import { ConnectorItem } from '../store/ConnectorItem';
import { MoveableItem } from '../store/MoveableItem';

export interface IEdgeRendererProperties {
    loadedObject: IStoryObject
}

export class EdgeRenderer extends Component {
    disposeReaction: IReactionDisposer;
    store = useContext(Store);
    two: Two;
    edges: Map<string, Two.Path>;

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

                        loadedObject?.childNetwork?.edges.map(
                            edge => ({
                                id: edge.id,
                                from: this.store.uistate.moveableItems.getValue(edge.from),
                                to: this.store.uistate.moveableItems.getValue(edge.to)
                            })
                        ).forEach(edge => {
                            if (edge && edge.from && edge.to) {
                                let twoPath = this.edges.get(edge.id);
                                if (twoPath) {
                                    this.redrawEdgeCurve(twoPath, edge.from.x, edge.from.y, edge.to.x, edge.to.y);
                                } else {
                                    twoPath = this.drawEdgeCurve(edge.from.x, edge.from.y, edge.to.x, edge.to.y);
                                    this.edges.set(edge.id, twoPath);
                                }
                                                           
                                if (twoPath) {
                                    const elem = document.getElementById(twoPath.id);
                                    elem?.addEventListener('click', () => {
                                        console.log("Clicked on", twoPath?.id);
                                })
                            }
                            }
                        });
                    }
                );

                return [
                    this.store.uistate.loadedItem,
                    loadedObject?.childNetwork?.edges.length
                ]
            },
            () => {
                this.setState({});
            }
        )

    }

    componentDidMount(): void {
        const obj = document.getElementById("edge-renderer");
        if (obj)
            this.two.appendTo(obj);
    }

    drawEdgeCurve(x1: number, y1: number, x2: number, y2: number): Two.Path {
        const c = this.two.makeCurve(x1, y1, x1 + 50, y1, x2 - 50, y2, x2, y2, true);
        c.linewidth = 5;
        c.cap = "round";
        c.noFill();
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
        return <div id="edge-renderer"></div>
    }
}