import { makeObservable, observable, runInAction } from "mobx";
import { createModelSchema, list, map, object, primitive } from "serializr";
import { HSlider, MenuTemplate } from "preact-sidebar";
import { IConnectorPort, ModifierType, CSSModifier, exportClass, CSSModifierData, CSSStatement } from "storygraph";

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
            // classes: true,
            classMap: observable,
            // inline: observable
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

    public get menuTemplate(): MenuTemplate[] {
        return [
            ...super.menuTemplate,
            ...["XS", "SM", "MD", "LG", "XL"].map(e => (
                this.makeSlider(e as Size)
            )),
        ];
    }

    public requestConnectors(): [string, IConnectorPort][] {
        return []
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }

    private makeSlider(key: Size): MenuTemplate {
        return new HSlider(
            key + " Width",
            {
                min: 1,
                max: 12,
                formatter: (val: string | number) => `${val} Column${(val === 1) ? "" : "s"}`
            },
            () => this.data.classMap.get(key) ?? 12,
            (value: number) => {
                const num = Number(value);
                runInAction(() => this.data.classMap.set(key, num))
            }
        )
    }
}

export const GridItemInlineStatementsSchema = createModelSchema(GridItemInlineStatements, {
    "grid-row": true,
    "grid-column": true
})

export const CSSGriditemModifierDataSchema = createModelSchema(GridItem, {
    // classes: list(primitive()),
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
