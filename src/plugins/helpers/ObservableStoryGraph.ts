import { makeObservable, observable, action } from 'mobx';
import { createModelSchema, list, object, primitive } from 'serializr';
import { IEdge, StoryGraph } from 'storygraph';
import { EdgeSchema } from '../../renderer/store/schemas/EdgeSchema';

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

export const ObservableStoryGraphSchema = createModelSchema(ObservableStoryGraph,{
    nodes: list(primitive()),
    edges: list(object(EdgeSchema)),
});
