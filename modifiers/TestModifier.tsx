import { makeObservable } from "mobx";
import { Component, Fragment, h } from "preact";
import { useEffect, useState } from "preact/hooks";
import { IConnectorPort, ReactionConnectorInPort } from "storygraph";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";

class Wrapper extends Component {
    render({children}, { amount }) {
        return <div style={`opacity: ${amount*100}%;`}>{
            children    
        }</div>
    }

    update(amount: number) {
        this.setState({
            amount: amount
        });
    }
}

export class TestModifier extends HMTLModifier {

    amount = 0;

    private _connectors = [
        new ReactionConnectorInPort("reaction-in", () => {
            console.log("Hello", this);
            this.amount = Math.random();
            document.dispatchEvent(new CustomEvent("reaction"));
        })
    ];

    // constructor() {
    //     super();

    //     makeObservable(this, {
    //         amount: true
    //     })
    // }

    modify(element: h.JSX.Element): h.JSX.Element {
        const Wrapper = () => {
            const[,setState] = useState({});
            useEffect(() => {
                const listener = () => {
                    console.log("Hello event!");
                    setState({});
                };
                document.addEventListener("reaction", listener);

                return () => {
                    document.removeEventListener("reaction", listener);
                }
            });

            // element.props.style = `${(element.props.style) ? element.props.style + " " : ""}opacity: ${this.amount * 100}%;`;

            return <div style={`opacity: ${this.amount * 100}%;`}>
                {element}
            </div>
        }

        return <Wrapper></Wrapper>
    }

    requestConnectors(): [string, IConnectorPort][] {
        return this._connectors.map(e => ([e.id, e]));
    }
}

export const plugInExport = exportClass(
    TestModifier,
    "Test",
    "internal.modifier.test",
    "icon-speaker",
    true
);
