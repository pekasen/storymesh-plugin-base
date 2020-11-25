import { observable, makeObservable } from "mobx";
import { IConnectorPort } from 'storygraph';
import { MoveableItem } from './MoveableItem';

export class ConnectorItem extends MoveableItem implements IConnectorPort {
    name: string;
    width: number;
    height: number;
    direction: "in" | "out";
    type: "flow" | "reaction" | "data";

    constructor(data: string, x: number, y: number, width: number, height: number, name: string, direction: "in" | "out", type: "flow" | "reaction" | "data") {
        super(data, x, y);
        this.width = width;
        this.height = height;
        this.name = name;
        this.direction = direction;
        this.type = type;

        makeObservable(this, {
            width: observable,
            height: observable
        });
    }
}
