import { makeObservable, observable, runInAction } from "mobx";
import { createModelSchema, list, map, mapAsArray, object, primitive } from "serializr";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { CSSModifier, CSSModifierData, CSSStatement } from "../helpers/CSSModifier";
import { serializeAsMeshReference } from "babylonjs";
import { ModifierType } from "storygraph";

interface IGridItemInlineStatements extends CSSStatement {
    "grid-row": string;
    "grid-column": string;
}

interface IGridItemModifierData extends CSSModifierData {
    inline: IGridItemInlineStatements;
}

export class GridItemInlineStatements implements IGridItemInlineStatements {
    "grid-row" = "";
    "grid-column" = "";

    [key: string]: string

    constructor() {
        makeObservable(this, {
            "grid-row": true,
            "grid-column": true
        });
    }
}

type Size = "XS" | "SM" | "MD" | "LG" | "XL";

export class GridItem implements IGridItemModifierData {
    
    public get classes (): string[] {
        return ["grid-item"].concat(
            Array.
            from(this.classMap).
            map(e => {
                return `${e[0].toLowerCase()}-${e[1]}`;
            })
        );
    }

    public inline = new GridItemInlineStatements();
    public classMap = new Map<Size, number>([
        ["XS", 12],
        ["SM", 12],
        ["MD", 6],
        ["LG", 6],
        ["XL", 3]
    ]);

    constructor() {
        makeObservable(this, {
            classes: true,
            classMap: observable,
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
            // {
            //     label: "Class",
            //     value: () => this.data.classes.join(" "),
            //     valueReference: (value: string) => runInAction(() => this.data.classes = value.split(" ")),
            //     type: "text"
            // },
            ...["XS", "SM", "MD", "LG", "XL"].map(e => (
                this.makeSlider(e as Size)
            )),
        ];
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }

    private makeSlider(key: Size): IMenuTemplate {
        return {
            label: key + " Width",
            value: () => this.data.classMap.get(key),
            valueReference: (value: string) => {
                const num = Number(value);

                runInAction(() => this.data.classMap.set(key, num))
            },
            type: "hslider",
            options: {
                min: 1,
                max: 12
            }
        }
    }
}

export const GridItemInlineStatementsSchema = createModelSchema(GridItemInlineStatements, {
    "grid-row": true,
    "grid-column": true
})

export const CSSGriditemModifierDataSchema = createModelSchema(GridItem, {
    classes: list(primitive()),
    data: object(GridItemInlineStatements),
    classMap: map(primitive())
});

export const CSSGriditemModifierSchema = createModelSchema(CSSGriditemModifier, {
    data: object(CSSGriditemModifierDataSchema)
});

export const plugInExport = exportClass(
    CSSGriditemModifier,
    "Grid Item",
    "internal.modifier.griditem",
    "icon-speaker",
    true
);
