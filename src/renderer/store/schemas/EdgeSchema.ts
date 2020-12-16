import { IEdge } from 'storygraph';
import { ModelSchema, identifier, createSimpleSchema } from 'serializr';

export const EdgeSchema: ModelSchema<IEdge> = createSimpleSchema({
    from: true,
    to: true,
    id: identifier(),
    parent: false
});
