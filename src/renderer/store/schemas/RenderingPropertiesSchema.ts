import { IRenderingProperties } from 'storygraph';
import { createSimpleSchema, ModelSchema } from 'serializr';


export const RenderingPropertiesSchema: ModelSchema<IRenderingProperties> = createSimpleSchema({
    width: true,
    order: true,
    collapsable: true
});