import { createSimpleSchema, ModelSchema } from 'serializr';
import { IStoryModifier } from 'storygraph';

// export const StoryModifierSchema: ModelSchema<IStoryModifier> = {
//     props: {
//         type: true,
//         parent: reference(AbstractStoryObjectSchema)
//     },
//     factory: ({ json, parentContext }) => ({
//         type: json.type,
//         parent: parentContext
//     })
// }

export const StoryModifierSchema: ModelSchema<IStoryModifier> = createSimpleSchema(
    {
        type: true,
        // parent: reference(AbstractStoryObjectSchema)
    }
);
