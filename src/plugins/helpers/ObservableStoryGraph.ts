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
    edges: list(object(EdgeSchema), {
        // afterDeserialize: (cb, err, newValue) => {
        //     // if (newValue instanceof AbstractStoryObject)

        //     // const graph = context.target as ObservableStoryGraph;
        //     // // graph.edges = [];
        //     // setTimeout(() => {
        //     //     newValue.forEach((edge: IEdge) => {
        //     //         const payload: INotificationData<IEdgeEvent> = {
        //     //             data: {
        //     //                 add: [edge]
        //     //             },
        //     //             source: this,
        //     //             type: "edge"
        //     //         };
        
        //     //         [
        //     //             ...StoryGraph.parseNodeId(edge.from),
        //     //             ...StoryGraph.parseNodeId(edge.to),
        //     //         ].forEach(id => {
        //     //             graph.notificationCenter.push(
        //     //                 id, payload
        //     //             )
        //     //         });
        //     //     });
        //     // }, 150)
        //     // // graph.connect(undefined, newValue);
        //     // // catches edges
        //     // Logger.info("caught", newValue, context);
        //     // cb(err, newValue);
        //     cb(err, newValue);
        // }
    }),
});
