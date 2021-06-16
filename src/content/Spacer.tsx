import { FunctionComponent, h } from "preact";
import { HSliderMenuItem, MenuTemplate } from "preact-sidebar";
import { action, computed, makeObservable, observable } from 'mobx';
import { exportClass, connectionField, nameField, StoryObject, INGWebSProps, FlowConnectorInPort, FlowConnectorOutPort, IConnectorPort, StoryGraph } from 'storygraph';
import { createModelSchema } from 'serializr';
import { StoryPlugIn } from "../../../storygraph/dist/StoryGraph/registry/PlugIn";
class _Spacer extends StoryObject {

    static defaultIcon = "icon-arrow-combo";

    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: {
        vspace: number
    };
    public childNetwork?: StoryGraph;
    // public vspace: number;
    public icon: string
    protected _connectors: Map<string, IConnectorPort>;

    constructor() {
        super();
        // this.makeDefaultConnectors();
        this.name = "Spacer";
        this.role = "internal.content.spacer";
        this.isContentNode = true;
        this.userDefinedProperties = {
            vspace: 10
        };
        // this.vspace = 10;
        this.icon = _Spacer.defaultIcon;
        const _in = new FlowConnectorInPort();
        const _out = new FlowConnectorOutPort();
        _in.associated = _out.id
        _out.associated = _in.id;

        this._connectors = new Map([
            [_in.id, _in],
            [_out.id, _out],
        ] as [string, IConnectorPort][]);

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable.deep,
            // vspace: observable,
            updateName: action,
            updateVSpace: action,
            connectors: computed,
            menuTemplate: computed
        });
    }

    public get menuTemplate(): MenuTemplate[] {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            {
                label: "Vertical Space",
                type: HSliderMenuItem,
                options: {
                    min: 0,
                    max: 100,
                    formatter: (val: number) => `${val}%`
                },
                getter: () => this.userDefinedProperties.vspace,
                setter: (vspace: number) => this.updateVSpace(vspace)
            },
            ...connectionField(this)
        ];
        if (super.menuTemplate && super.menuTemplate.length >= 1) ret.push(...super.menuTemplate);
        return ret;
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public updateVSpace(vspace: number): void {
        this.userDefinedProperties.vspace = vspace;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({ userDefinedProperties }) => {
            return <div class="spacer" style={`height:${userDefinedProperties.vspace}vh; width: 100%;`}></div>
        }
        return Comp
    }
}

createModelSchema(_Spacer, {})


export const plugInExport = exportClass(
    _Spacer,
    "Spacer",
    "internal.content.spacer",
    _Spacer.defaultIcon,
    true
);

export const SpacerPlugIn: StoryPlugIn = {
    name: "Spacer",
    id: "internal.content.spacer",
    public: true,
    icon: _Spacer.defaultIcon,

    // package: {},
    constructor: _Spacer
}
