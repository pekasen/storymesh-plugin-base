import { makeObservable, observable, action } from 'mobx';
import { createModelSchema, list, object, reference, RefLookupFunction } from 'serializr';
import { IEdge, IStoryObject, StoryGraph } from 'storygraph';
import { rootStore } from '../../renderer';
import { EdgeSchema } from '../../renderer/store/schemas/EdgeSchema';
import {  StoryObject } from './AbstractStoryObject';

export class ObservableStoryGraph extends StoryGraph {
    constructor(parent: IStoryObject, nodes?: IStoryObject[], edges?: IEdge[]) {
        super(parent, nodes, edges);

        makeObservable(new StoryGraph(parent), {
            nodes: observable,
            edges: observable,
            addNode: action,
            connect: action,
            disconnect: action,
            removeNode: action
        })
    }
}
// RefLookupFunction
export const lookUpNode: RefLookupFunction = (
        id,
        callback,
        context
    ) => {
        const reg = rootStore._loadingCache;
        console.log("fetching", id, "from", reg);
        const instance = reg.get(id);
        if (!instance) setTimeout(() => lookUpNode(id, callback, context), 1)
        else callback(null, instance);
}

export const ObservableStoryGraphSchema = createModelSchema(ObservableStoryGraph,{
    nodes: list(reference(StoryObject, lookUpNode)), // lookUpNode
    edges: list(object(EdgeSchema)),
    parent: reference(StoryObject, lookUpNode), // lookUpNode
    // addNode: false,
    // connect: false,
    // disconnect: false,
    // removeNode: false,
    // willDeregister: false,
    // traverse: false,
    // filterNodes: false,
    // filterEdges: false
});
