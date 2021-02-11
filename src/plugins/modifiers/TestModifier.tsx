import { h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { createModelSchema, object } from "serializr";
import { IConnectorPort, ReactionConnectorInPort } from "storygraph";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";
export class TestModifier extends HMTLModifier {

    public role = "internal.modifier.test";
    private _trigFun = () => {
        console.log("Hello", this);
        this._reactionStack.forEach(e => e());
    }
    private _connector = new ReactionConnectorInPort("reaction-in", this._trigFun);
    private _reactionStack: (() => void)[] = [];

    modify(element: h.JSX.Element): h.JSX.Element {
        const Wrapper = () => {
            const [state ,setState] = useState({
                toggle: true
            });
            useEffect(() => {
                const listener = () => {
                    console.log("Hello event!");
                    setState({
                        toggle: !state.toggle
                    });
                };
                this._reactionStack.push(listener);
                this._connector.handleNotification = this._trigFun;
                return () => {
                    this._reactionStack.splice(
                        this._reactionStack.indexOf(listener, 1)
                    );
                }
            });

            return <div id={this.id} class={(element.props.class ? element.props.class + " " : "") + (state.toggle ? "active" : "inactive")}>
                {element}
<style>{`#${this.id} {
    transition: transform 2s ease-out;
}
#${this.id}.active {
    transform: translate(-500px, 0px)
}
#${this.id}.inactive {
    transform: translate(0px, 0px)
}
`}</style>
            </div>
        }

        return <Wrapper></Wrapper>
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
