import { createModelSchema, list, object, optional } from 'serializr';
import { ConnectorPort, DataConnectorInPort, DataConnectorOutPort, FlowConnectorInPort, FlowConnectorOutPort, IConnectorPort, ReactionConnectorInPort, ReactionConnectorOutPort } from 'storygraph';
import { EdgeSchema } from './EdgeSchema';

export const ConnectorSchema = createModelSchema(ConnectorPort, {
    _name: optional(true),
    id: true,
    direction: true,
    type: true,
    connections: list(object(EdgeSchema)),
    associated: false
}, (context) => {
    console.log("caught", context);
    // const { parentContext } = context;
    const { json } = context;
    switch (json.type) {
        case "flow": if (json.direction === "in")
            return new FlowConnectorInPort();
            else return new FlowConnectorOutPort();
        case "data": if (json.direction === "in")
            return new DataConnectorInPort("data-in", () => "");
            else return new DataConnectorOutPort("data-out", () => undefined);
        case "reaction": if (json.direction === "in")
            return new ReactionConnectorInPort("name", () => undefined);
            else return new ReactionConnectorOutPort("reaction-out");
    }
    return new ConnectorPort("flow", "in");
})