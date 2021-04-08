import { makeObservable, observable } from "mobx";
import { Component, createRef, h } from "preact";
import { createModelSchema, list, object } from "serializr";
import { ReactionConnectorOutPort, IConnectorPort } from "storygraph";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import { MenuTemplate } from "preact-sidebar";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";

export class OnExitView {
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

class OnExitViewModifierData {
    onExitView: OnExitView;
    [key: string]: unknown;

    constructor() {
        this.onExitView = new OnExitView();

        makeObservable(this, {
            onExitView: observable
        })
    }
}

export interface IHTMLOnExitViewModifierProperties {
    wrapperObject: HTMLOnExitViewModifier
}

export class HTMLOnExitViewModifier extends HMTLModifier {
    public name = "OnExitView Modifier"
    public role = "internal.modifier.OnExitView";
    public data = new OnExitViewModifierData();
    observer: IntersectionObserver | undefined;
    
    constructor() {
        super();        
        
        makeObservable(this, {
            data: observable
        });
    }

    public modify(element: h.JSX.Element): h.JSX.Element {       

        class WrapperComponent extends Component<IHTMLOnExitViewModifierProperties> {            
            elemRef = createRef();
            wrapper: HTMLOnExitViewModifier;
            
            constructor(props: IHTMLOnExitViewModifierProperties) {
                super();
                this.wrapper = props.wrapperObject;
                let thatWrapper = this.wrapper;
                function onExit(entry: IntersectionObserverEntry[]) {
                    entry.forEach((change) => {
                        if (!change.isIntersecting) {
                            thatWrapper.data.onExitView.reactionOut.notify();
                        } 
                    });
                }

                let options = {
                    threshold: [0.5]
                };
                  
                thatWrapper.observer = new IntersectionObserver(onExit, options);                
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

    // TODO: reaction outputs are not deleted if OnExitView is deleted
    public requestConnectors(): [string, IConnectorPort][] {        
        const out = this.data.onExitView.reactionOut;
        out.name = this.data.onExitView.name;
        return [[out.id, out]];        
    }
}

export const OnExitViewSchema = createModelSchema(OnExitView, {
    name: true,
    reactionOut: object(ConnectorSchema)
});

export const HTMLOnExitViewModifierSchema = createModelSchema(HTMLOnExitViewModifier, {
    data: object(OnExitViewModifierData),
    name: true,
    role: true
});

export const plugInExport = exportClass(
    HTMLOnExitViewModifier,
    "OnExitView",
    "internal.modifier.OnExitView",
    "icon-eye",
    true
);
