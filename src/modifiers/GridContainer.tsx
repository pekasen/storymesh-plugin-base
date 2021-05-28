import { makeObservable, observable, runInAction } from "mobx";
import { createModelSchema, list, object, primitive } from "serializr";
import { HSlider, MenuTemplate } from "preact-sidebar";
import { IConnectorPort, ModifierType } from "storygraph";

import { exportClass } from "../helpers/exportClass";
import { CSSModifier, CSSModifierData, CSSStatement } from "../helpers/CSSModifier";

interface IGridContainerInlineStatements extends CSSStatement {
    "grid-gap": string;
}

interface IGridContainerModifierData extends CSSModifierData {
    inline: IGridContainerInlineStatements;
}

class GridContainerInlineStatements implements IGridContainerInlineStatements {
    public "grid-gap" = "15px";
    constructor() {
        makeObservable(this, {
            "grid-gap": true
        });
    }

    [key: string]: string
}

export class GridContainer implements IGridContainerModifierData {
    
    public classes = ["grid-container", "grid-12"];
    public inline = new GridContainerInlineStatements();

    constructor() {
        makeObservable(this, {
            classes: true,
            inline: true
        });
    }
}

export class CSSGridContainerModifier extends CSSModifier {
    public name = "Grid Container"
    public role = "internal.modifier.gridcontainer";
    public data: GridContainer = new GridContainer();
    public type: ModifierType = "css-hybrid";

    constructor() {
        super();

        makeObservable(this, {
            data: observable
        })
    }

    public get menuTemplate(): MenuTemplate[] {
        return [
            ...super.menuTemplate,
            // {
            //     label: "Display",
            //     type: "dropdown",
            //     value: () => this.data.display,
            //     valueReference: (value: string) => runInAction(() => this.data.display = (value === "grid") ? value : "inline-grid"),
            //     options: ["grid", "inline-grid"]
            // },
            new HSlider(
                "Gap",
                {
                    formatter: (arg: string | number) => (`${arg}px`),
                    min: 0,
                    max: 150
                },
                () => Number(this.data.inline["grid-gap"]),
                (value: number) => {
                    const _value = `${value}px`;
                    // validate user input
                    const test = /\d+px/gm;
                    if (test.test(_value)) {
                        runInAction(() => this.data.inline["grid-gap"] = _value)
                        
                    }
                }
            ),
            // {
            //     label: "Gap",
            //     type: "text",
            //     value: () => this.data.inline["grid-gap"],
            //     valueReference: (value: string) => {
            //         // validate user input
            //         const test = /\d+px/gm;
            //         if (test.test(value)) {
            //             runInAction(() => this.data.inline["grid-gap"] = value)
            //         }
            //     }
            // },
            // {
            //     label: "Rows",
            //     type: "text",
            //     value: () => this.data["grid-template-rows"],
            //     valueReference: (value: string) => runInAction(() => this.data["grid-template-rows"] = value)
            // },
        ];
    }

    public requestConnectors(): [string, IConnectorPort][] {
        return []
    }
    
    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }
}

export const GridContainerInlineStatementsSchema = createModelSchema(GridContainerInlineStatements, {
    "grid-gap": true
});

export const CSSGridContainerModifierDataSchema = createModelSchema(GridContainer, {
    classes: list(primitive()),
    inline: object(GridContainerInlineStatements)
});

export const CSSGridContainerModifierSchema = createModelSchema(CSSGridContainerModifier, {
    data: object(CSSGridContainerModifierDataSchema)
});

export const plugInExport = exportClass(
    CSSGridContainerModifier,
    "Grid Container",
    "internal.modifier.gridcontainer",
    "icon-speaker",
    true
);
