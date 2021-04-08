import { makeObservable, observable } from "mobx";
import { Component, createRef, h } from "preact";
import { createModelSchema, list, object } from "serializr";
import { ReactionConnectorOutPort, IConnectorPort } from "storygraph";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import { MenuTemplate } from "preact-sidebar";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";

export class OnEnterView {
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

class OnEnterViewModifierData {
    onEnterView: OnEnterView;
    [key: string]: unknown;

    constructor() {
        this.onEnterView = new OnEnterView();

        makeObservable(this, {
            onEnterView: observable
        })
    }
}

export interface IHTMLOnEnterViewModifierProperties {
    wrapperObject: HTMLOnEnterViewModifier
}

export class HTMLOnEnterViewModifier extends HMTLModifier {
    public name = "OnEnterView Modifier"
    public role = "internal.modifier.OnEnterView";
    public data = new OnEnterViewModifierData();
    observer: IntersectionObserver | undefined;
    
    constructor() {
        super();        
        
        makeObservable(this, {
            data: observable
        });
    }

    public modify(element: h.JSX.Element): h.JSX.Element {       

        class WrapperComponent extends Component<IHTMLOnEnterViewModifierProperties> {            
            elemRef = createRef();
            wrapper: HTMLOnEnterViewModifier;
            
            constructor(props: IHTMLOnEnterViewModifierProperties) {
                super();
                this.wrapper = props.wrapperObject;
                let thatWrapper = this.wrapper;
                function onEntry(entry: IntersectionObserverEntry[]) {
                    entry.forEach((change) => {
                        if (change.isIntersecting) {
                            thatWrapper.data.onEnterView.reactionOut.notify();
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

    // TODO: reaction outputs are not deleted if OnEnterView is deleted
    public requestConnectors(): [string, IConnectorPort][] {        
        const out = this.data.onEnterView.reactionOut;
        out.name = this.data.onEnterView.name;
        return [[out.id, out]];        
    }
}

export const OnEnterViewSchema = createModelSchema(OnEnterView, {
    name: true,
    reactionOut: object(ConnectorSchema)
});

export const HTMLOnEnterViewModifierSchema = createModelSchema(HTMLOnEnterViewModifier, {
    data: object(OnEnterViewModifierData),
    name: true,
    role: true
});

export const plugInExport = exportClass(
    HTMLOnEnterViewModifier,
    "OnEnterView",
    "internal.modifier.OnEnterView",
    "icon-eye",
    true
);
