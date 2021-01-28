import { makeObservable, observable, runInAction } from "mobx";
import { createModelSchema, list, object, primitive } from "serializr";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { CSSModifier, CSSModifierData, CSSStatement } from "../helpers/CSSModifier";
import { ModifierType } from "storygraph";

interface IGridItemInlineStatements extends CSSStatement {
    "grid-row": string;
    "grid-column": string;
}

interface IGridItemModifierData extends CSSModifierData {
    inline: IGridItemInlineStatements;
}

export class GridItemInlineStatements implements IGridItemInlineStatements {
    "grid-row" = "auto";
    "grid-column" = "auto";

    [key: string]: string

    constructor() {
        makeObservable(this, {
            "grid-row": true,
            "grid-column": true
        });
    }
}

export class GridItem implements IGridItemModifierData {
    
    public classes = ["grid-item"];
    public inline = new GridItemInlineStatements();

    constructor() {
        makeObservable(this, {
            classes: true,
            inline: observable
        });
    }
}

export class CSSGriditemModifier extends CSSModifier {
    public name = "Grid item"
    public role = "internal.modifier.griditem";
    public type: ModifierType = "css-class";
    public data: GridItem = new GridItem();

    constructor() {
        super();

        makeObservable(this, {
            data: observable
        })
    }

    public get menuTemplate(): IMenuTemplate[] {
        return [
            ...super.menuTemplate,
            // {
            //     label: "Display",
            //     type: "dropdown",
            //     value: () => this.data.display,
            //     valueReference: (value: string) => runInAction(() => this.data.display = (value === "grid") ? value : "inline-grid"),
            //     options: ["grid", "inline-grid"]
            // },
            // {
            //     label: "Row Start",
            //     type: "text",
            //     value: () => this.data.inline["grid-row"],
            //     valueReference: (value: string) => {
            //         // validate user input
            //         runInAction(() => this.data.inline["grid-row"] = value)
            //         // const test = /\d+px/gm;
            //         // if (test.test(value)) {
            //         // }
            //     }
            // },
            // {
            //     label: "Column Start",
            //     type: "text",
            //     value: () => this.data.inline["grid-column"],
            //     valueReference: (value: string) => {
            //         // validate user input
            //         runInAction(() => this.data.inline["grid-column"] = value)
            //         // const test = /\d+px/gm;
            //         // if (test.test(value)) {
            //         // }
            //     }
            // },
            {
                label: "Class",
                value: () => this.data.classes.join(" "),
                valueReference: (value: string) => runInAction(() => this.data.classes = value.split(" ")),
                type: "text"
            }
            // {
            //     label: "Rows",
            //     type: "text",
            //     value: () => this.data["grid-template-rows"],
            //     valueReference: (value: string) => runInAction(() => this.data["grid-template-rows"] = value)
            // },
        ];
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }
}

export const GridItemInlineStatementsSchema = createModelSchema(GridItemInlineStatements, {
    "grid-row": true,
    "grid-column": true
})

export const CSSGriditemModifierDataSchema = createModelSchema(GridItem, {
    classes: list(primitive()),
    data: object(GridItemInlineStatements)
});

export const CSSGriditemModifierSchema = createModelSchema(CSSGriditemModifier, {
    data: object(CSSGriditemModifierDataSchema)
});

export const plugInExport = exportClass(
    CSSGriditemModifier,
    "Grid item",
    "internal.modifier.griditem",
    "icon-speaker",
    true
);
