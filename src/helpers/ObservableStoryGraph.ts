import { makeObservable, observable, action } from "mobx";
import { IEdge, StoryGraph } from "storygraph";

export class ObservableStoryGraph extends StoryGraph {
    constructor(parent: string, nodes?: string[], edges?: IEdge[]) {
        super(parent, nodes, edges);
        
        makeObservable(this, {
            nodes: observable,
            edges: observable,
            addNode: action,
            connect: action,
            disconnect: action,
            removeNode: action
        });
    }
}
