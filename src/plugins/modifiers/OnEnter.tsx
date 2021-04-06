import { makeObservable, observable } from "mobx";
import { Component, createRef, h } from "preact";
import { createModelSchema, list, object } from "serializr";
import { ReactionConnectorOutPort, IConnectorPort } from "storygraph";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import { MenuTemplate } from "preact-sidebar";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";

export class OnEnter {
    protected _name: string | undefined;    
    public reactionOut = new ReactionConnectorOutPort("reaction-out");
    public debug = false;    

    constructor() {}

    public get(property: string): string | number | undefined {
        switch (property) {
            case "name": return this.name;
            default: break;
        }
    }

    public get name(): string {
        return `${this._name}`
    }

    public set name(name: string) {
        this._name = name
    }
}

class OnEnterModifierData {
    onEnter: OnEnter;
    [key: string]: unknown;

    constructor() {
        this.onEnter = new OnEnter();

        makeObservable(this, {
            onEnter: observable
        })
    }
}

export interface IHTMLOnEnterModifierProperties {
    wrapperObject: HTMLOnEnterModifier
}

export class HTMLOnEnterModifier extends HMTLModifier {
    public name = "OnEnter Modifier"
    public role = "internal.modifier.OnEnter";
    public data = new OnEnterModifierData();
    observer: IntersectionObserver | undefined;
    
    constructor() {
        super();        
        
        makeObservable(this, {
            data: observable
        });
    }

    public modify(element: h.JSX.Element): h.JSX.Element {       

        class WrapperComponent extends Component<IHTMLOnEnterModifierProperties> {            
            elemRef = createRef();
            wrapper: HTMLOnEnterModifier;
            
            constructor(props: IHTMLOnEnterModifierProperties) {
                super();
                this.wrapper = props.wrapperObject;
                let thatWrapper = this.wrapper;
                function onEntry(entry: IntersectionObserverEntry[]) {
                    entry.forEach((change) => {
                        if (change.isIntersecting) {
                            thatWrapper.data.onEnter.reactionOut.notify();
                            // TODO: why doesn't this work with the HeroObject?
                        } 
                    });
                }

                let options = {
                    threshold: [0.5]
                };
                  
                thatWrapper.observer = new IntersectionObserver(onEntry, options);                
            }

            render() {
                return <div ref={this.elemRef}>{this.props.children}</div>
            }

            componentDidMount() {
               this.wrapper.observer?.observe(this.elemRef.current);
            }

            componentWillUnmount() {        
                this.wrapper.observer?.unobserve(this.elemRef.current);
            }

        }

        return <WrapperComponent wrapperObject={this}>{element}</WrapperComponent>;
    }

    public get menuTemplate(): MenuTemplate[] {
        return [
            ...super.menuTemplate
        ];
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }

    // TODO: reaction outputs are not deleted if OnEnter is deleted
    public requestConnectors(): [string, IConnectorPort][] {        
        const out = this.data.onEnter.reactionOut;
        out.name = this.data.onEnter.name;
        return [[out.id, out]];        
    }
}

export const OnEnterSchema = createModelSchema(OnEnter, {
    name: true,
    reactionOut: object(ConnectorSchema)
});

export const HTMLOnEnterModifierSchema = createModelSchema(HTMLOnEnterModifier, {
    data: object(OnEnterModifierData),
    name: true,
    role: true
});

export const plugInExport = exportClass(
    HTMLOnEnterModifier,
    "OnEnter",
    "internal.modifier.OnEnter",
    "icon-mouse",
    true
);
