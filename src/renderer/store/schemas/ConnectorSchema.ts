import { createSimpleSchema, ModelSchema, optional } from 'serializr';
import { IConnectorPort } from 'storygraph';

export const ConnectorSchema: ModelSchema<IConnectorPort> = createSimpleSchema({
    name: true,
    direction: true,
    type: true,
    associated: false
});
