import { FunctionComponent, h } from "preact";
import { INGWebSProps, IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";

import { action, makeObservable, observable } from 'mobx';
import { StoryGraph } from 'storygraph';
import { StoryObject } from '../helpers/AbstractStoryObject';
import { connectionField, nameField } from '../helpers/plugInHelpers';
import { exportClass } from '../helpers/exportClass';
import { createModelSchema } from 'serializr';

class _Spacer extends StoryObject {

    static defaultIcon = "icon-arrow-combo";

    public name: string;
    public role: string;
    public isContentNode: boolean;
    public userDefinedProperties: unknown;
    public childNetwork?: StoryGraph;
    public vspace: number;

    constructor() {
        super();
        this.makeDefaultConnectors();
        this.name = "Spacer";
        this.role = "internal.content.spacer";
        this.isContentNode = true;
        this.userDefinedProperties = {};

        this.vspace = 10;

        makeObservable(this, {
            name: observable,
            userDefinedProperties: observable,
            //connectors: observable.shallow,
            vspace: observable,
            updateName: action,
            updateVSpace: action
        });

    }

    public get menuTemplate(): IMenuTemplate[] {
        const ret: IMenuTemplate[] = [
            ...nameField(this),
            {
                label: "Vertical Space",
                type: "hslider",
                options: {
                    min: 0,
                    max: 100,
                    formatter: (val: number) => `${val}%`
                },
                value: () => this.vspace,
                valueReference: (vspace: number) => this.updateVSpace(vspace)
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
        this.vspace = vspace;
    }

    public getComponent(): FunctionComponent<INGWebSProps> {
        const Comp: FunctionComponent<INGWebSProps> = ({ }) => {
            return <div class="spacer" style={`height:${this.vspace}vh; width: 100%;`}></div>
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
)