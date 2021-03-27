import { makeObservable, observable } from "mobx";
import { h } from "preact";
import { createModelSchema, list, object } from "serializr";
import { ReactionConnectorOutPort, IConnectorPort } from "storygraph";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import { MenuTemplate } from "preact-sidebar";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";
import Logger from "js-logger";

export class OnClick {
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

class OnClickModifierData {
    onClick: OnClick;
    [key: string]: unknown
    
    constructor() {
        this.onClick = new OnClick();

        makeObservable(this, {
            onClick: observable
        })
    }
}

export class HTMLOnClickModifier extends HMTLModifier {
    public name = "OnClick Modifier"
    public role = "internal.modifier.OnClick";
    public data = new OnClickModifierData();

    constructor() {
        super();

        makeObservable(this, {
            data: observable
        });
    }

    public modify(element: h.JSX.Element): h.JSX.Element {
        // Hacky this/that trick
        // eslint-disable-next-line @typescript-eslint/no-this-alias

        return <div class="clickable" onClick={() => {
            Logger.info("Sending notification to", this.data.onClick.reactionOut);
            this.data.onClick.reactionOut.notify();
        }}>{element}</div>
    }

    public get menuTemplate(): MenuTemplate[] {
        return [
            ...super.menuTemplate
        ];
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }

    // TODO: reaction outputs are not deleted if OnClick is deleted
    public requestConnectors(): [string, IConnectorPort][] {        
        const out = this.data.onClick.reactionOut;
        out.name = this.data.onClick.name;
        return [[out.id, out]];        
    }
}

export const OnClickSchema = createModelSchema(OnClick, {
    name: true,
    reactionOut: object(ConnectorSchema)
});

export const HTMLOnClickModifierSchema = createModelSchema(HTMLOnClickModifier, {
    data: object(OnClickModifierData),
    name: true,
    role: true
});

export const plugInExport = exportClass(
    HTMLOnClickModifier,
    "OnClick",
    "internal.modifier.OnClick",
    "icon-mouse",
    true
);
