import { h } from "preact";
import { createModelSchema, object } from "serializr";
import { IConnectorPort, ReactionConnectorInPort } from "storygraph";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";

import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
export class TestModifier extends HMTLModifier {

    public name = "Transition"
    public role = "internal.modifier.test";
    public data = {
        toggle: true
    }
    private _trigFun = () => {
        console.log("Hello", this);
        this.data.toggle = !this.data.toggle
        // request rerendering
        this._connector.notificationCenter?.push(this._connector.parent+"/rerender")
    }
    private _connector = new ReactionConnectorInPort("reaction-in", this._trigFun);

    modify(element: h.JSX.Element): h.JSX.Element {
        this._connector.handleNotification = this._trigFun;
        const Style = () => <style  type="text/css" scoped>{`#_${this.id} {
    transition: transform 2s ease-out;
}
#_${this.id}.active {
    transform: translate(-500px, 0px)
}
#_${this.id}.inactive {
    transform: translate(0px, 0px)
}
`}</style>

        return <div>
            <Style />
            <div id={`_${this.id}`} class={(this.data.toggle) ? "active" : "inactive"}>
                {element}
            </div>
        </div>
    }

    requestConnectors(): [string, IConnectorPort][] {
        return [[this._connector.id, this._connector]];
    }
}

export const TestModifierSchema = createModelSchema(TestModifier, {
    _connector: object(ConnectorSchema)
});

export const plugInExport = exportClass(
    TestModifier,
    "Test",
    "internal.modifier.test",
    "icon-speaker",
    true
);
