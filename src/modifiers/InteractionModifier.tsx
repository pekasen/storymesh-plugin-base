import { makeObservable, observable, runInAction } from "mobx";
import { Component, createRef, h } from "preact";
import { createModelSchema, object } from "serializr";
import { dropDownField, nameField, HTMLModifier, exportClass, ConnectorSchema, ReactionConnectorOutPort, IConnectorPort, ModifierPlugIn } from "storygraph";
import { MenuTemplate } from "preact-sidebar";
export class InteractionModifier {
    protected _name: string | undefined;
    public reactionOut = new ReactionConnectorOutPort("reaction-out");
    public debug = false;

    constructor() { }

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

class InteractionModifierData {
    interactionModifier: InteractionModifier;
    [key: string]: unknown;

    constructor() {
        this.interactionModifier = new InteractionModifier();

        makeObservable(this, {
            interactionModifier: observable
        })
    }
}

export interface IHTMLInteractionModifierProperties {
    wrapperObject: HTMLInteractionModifier
}

class WrapperComponent extends Component<IHTMLInteractionModifierProperties> {
    elemRef = createRef();
    wrapper: HTMLInteractionModifier;

    constructor(props: IHTMLInteractionModifierProperties) {
        super();
        this.wrapper = props.wrapperObject;
    }

    render() {
        return <div ref={this.elemRef}>{this.props.children}</div>
    }

    componentDidMount() {
        this.wrapper.intersectionObserver?.observe(this.elemRef.current);
    }
}

export class HTMLInteractionModifier extends HTMLModifier {
    public name = "Interaction"
    public role = "internal.modifier.InteractionModifier";
    public data = new InteractionModifierData();
    intersectionObserver: IntersectionObserver | undefined;
    public interactionOption: string;
    public static defaultIcon = "icon-mouse";

    constructor() {
        super();
        this.interactionOption = "click";
        makeObservable(this, {
            data: observable,
            interactionOption: observable
        });
    }


    public modify(element: h.JSX.Element): h.JSX.Element {

        switch (this.interactionOption) {
            case "enter-view":
                {
                    class WrapperComponentEnter extends WrapperComponent {
                        constructor(props: IHTMLInteractionModifierProperties) {
                            super(props);
                            const thatWrapper = this.wrapper;

                            function onEntry(entry: IntersectionObserverEntry[]) {
                                entry.forEach((change) => {
                                    if (change.isIntersecting) {
                                        thatWrapper.data.interactionModifier.reactionOut.notify();
                                    }
                                });
                            }

                            let options = { threshold: [0.5] };
                            thatWrapper.intersectionObserver = new IntersectionObserver(onEntry, options);
                        }
                    }
                    return <WrapperComponentEnter wrapperObject={this}>{element}</WrapperComponentEnter>;
                }
            case "exit-view":
                {
                    class WrapperComponentExit extends WrapperComponent {
                        constructor(props: IHTMLInteractionModifierProperties) {
                            super(props);
                            const thatWrapper = this.wrapper;

                            function onExit(entry: IntersectionObserverEntry[]) {
                                entry.forEach((change) => {
                                    if (!change.isIntersecting) {
                                        thatWrapper.data.interactionModifier.reactionOut.notify();
                                    }
                                });
                            }

                            let options = { threshold: [0.5] };
                            thatWrapper.intersectionObserver = new IntersectionObserver(onExit, options);
                        }
                    }

                    return <WrapperComponentExit wrapperObject={this}>{element}</WrapperComponentExit>;
                }
            case "click": {
                return <div onClick={() => {
                    this.data.interactionModifier.reactionOut.notify();
                }}>{element}</div>
            }
            case "double-click": {
                return <div onDblClick={() => {
                    this.data.interactionModifier.reactionOut.notify();
                }}>{element}</div>
            }
            case "pointer-enter": {
                return <div onPointerEnter={() => {
                    this.data.interactionModifier.reactionOut.notify();
                }}>{element}</div>
            }
            case "pointer-exit": {
                return <div onPointerLeave={() => {
                    this.data.interactionModifier.reactionOut.notify();
                }}>{element}</div>
            }
            default: {
                return <div></div>
            }
        }
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...super.menuTemplate,
            ...nameField(this),
            //TODO: Slider should be configurable to do half-steps
            ...dropDownField(
                this,
                () => ["click", "double-click", "enter-view", "exit-view", "hover"],
                () => this.interactionOption,
                (selection: string) => {
                    runInAction(() => this.interactionOption = selection);
                }
            )];
        return ret;
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }

    // TODO: reaction outputs are not deleted if InteractionModifier is deleted
    public requestConnectors(): [string, IConnectorPort][] {
        const out = this.data.interactionModifier.reactionOut;
        out.name = this.data.interactionModifier.name;
        return [[out.id, out]];
    }
}

export const InteractionSchema = createModelSchema(InteractionModifier, {
    name: true,
    reactionOut: object(ConnectorSchema)
});

export const HTMLInteractionModifierSchema = createModelSchema(HTMLInteractionModifier, {
    data: object(InteractionModifierData),
    name: true,
    role: true
});

export const plugInExport = exportClass(
    HTMLInteractionModifier,
    "Interaction",
    "internal.modifier.InteractionModifier",
    "icon-mouse",
    true
);

export const HTMLInteractionModifierPlugIn: ModifierPlugIn = {
    name: "Interaction",
    id: "internal.modifier.interactionmodifier",
    public: true,
    icon: HTMLInteractionModifier.defaultIcon,

    // package: {},
    constructor: HTMLInteractionModifier
}
