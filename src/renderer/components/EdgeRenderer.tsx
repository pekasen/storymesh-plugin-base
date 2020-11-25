import { IReactionDisposer, reaction } from 'mobx';
import { Component, h } from 'preact';
import { useContext } from 'preact/hooks';
import { IEdge, IStoryObject, StoryGraph } from 'storygraph';
import Two from 'twojs-ts';
import { Store } from '..';
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

        let moveableItems: MoveableItem[];

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
                    (e) => {
                        this.setState({});

                        loadedObject?.childNetwork?.edges.map(
                            edge => ({
                                id: edge.id,
                                from: this.store.uistate.moveableItems.getValue(StoryGraph.parseNodeId(edge.from)[0]),
                                to: this.store.uistate.moveableItems.getValue(StoryGraph.parseNodeId(edge.to)[0])
                            })
                        ).forEach(edge => {
                            if (edge && edge.from && edge.to) {
                                const edg = this.edges.get(edge.id);
                                if (edg) {
                                    this.redrawEdgeCurve(edg, edge.from.x, edge.from.y, edge.to.x, edge.to.y);
                                } else {
                                    this.edges.set(edge.id, this.drawEdgeCurve(edge.from.x, edge.from.y, edge.to.x, edge.to.y));
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
        const c = this.two.makeCurve(x1, y1, x1 + 100, y1, x2 - 100, y2, x2, y2, true);
        c.linewidth = 5;
        c.cap = "round";
        c.noFill();
        this.two.update();
        return c;
    }

    redrawEdgeCurve(c: Two.Path, x1: number, y1: number, x2: number, y2: number): void {
        c.vertices.forEach((v) => {     
            console.log("Verts: ", v.x, v.y);
        })

        c.vertices[0].x = x1;
        c.vertices[0].y = y1;
        c.vertices[1].x = x1 + 100;
        c.vertices[1].y = y1;
        c.vertices[2].x = x2 - 100;
        c.vertices[2].y = y2;
        c.vertices[3].x = x2;
        c.vertices[3].y = y2;

        c.vertices.forEach((v) => {     
            console.log("Verts: ", v.x, v.y);
        })
    }

    render(): h.JSX.Element {
        return <div id="edge-renderer"></div>
    }
}