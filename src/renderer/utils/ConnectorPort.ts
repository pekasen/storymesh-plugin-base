import { IConnectorPort } from "storygraph";

export type ConnectorType = "flow" | "reaction" | "data";
export type ConnectorDirection = "in" | "out";

export class ConnectorPort implements IConnectorPort {
    type: ConnectorType;
    direction: ConnectorDirection;

    constructor(type: ConnectorType, direction: ConnectorDirection) {
        this.type = type;
        this.direction = direction;
    }

    get name(): string {
        return [this.type, this.direction].join("-")
    }

    reverse(): ConnectorPort {
        const _dir = (this.direction === "in") ? "out" : "in";
        return new ConnectorPort(this.type, _dir);
    }
}
