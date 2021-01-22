import { makeObservable, observable, runInAction } from "mobx";
import { createModelSchema, object } from "serializr";
import { ModifierType } from "storygraph";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { ObservableStoryModifier } from "../helpers/AbstractModifier";

interface IGridContainer {
    "display": "grid" | "inline-grid";
    "grid-template-columns": string;
    "grid-template-rows": string;
    "grid-gap": string;
    "grid-row-gap"?: string;
    "grid-column-gap"?: string;
    "justify-items"?: string;
    "align-items"?: string;
}

interface IStringIndexable {
    [key: string]: string | undefined;
}

export class GridContainer implements IGridContainer, IStringIndexable {
    [key: string]: string | undefined;
    
    public "display": "grid" | "inline-grid";
    public "grid-template-columns": string;
    public "grid-template-rows": string;
    public "grid-gap": string;
    public "grid-row-gap"?: string | undefined;
    public "grid-column-gap"?: string | undefined;
    public "justify-items"?: string | undefined;
    public "align-items"?: string | undefined;

    constructor(
        display: "grid" | "inline-grid",
        gridTemplateColumns: string,
        gridTemplateRows: string,
        gridGap: string
    ) {
        this["display"] = display;
        this["grid-template-columns"] = gridTemplateColumns;
        this["grid-template-rows"] = gridTemplateRows;
        this["grid-gap"] = gridGap;

        makeObservable(this, {
            "display": true,
            "grid-template-columns": true,
            "grid-template-rows": true,
            "grid-gap": true
        });
    }
}

export class CSSGridContainerModifier extends ObservableStoryModifier<IGridContainer> {
    public readonly type: ModifierType = "css-inline";
    public name = "Grid Container"
    public role = "internal.modifier.gridcontainer";
    public data: GridContainer = new GridContainer(
        "grid",
        "1fr 1fr 1fr 1fr",
        "",
        "1px"
    );

    constructor() {
        super();

        makeObservable(this, {
            data: observable
        })
    }

    public get menuTemplate(): IMenuTemplate[] {
        return [
            ...super.menuTemplate,
            {
                label: "Display",
                type: "dropdown",
                value: () => this.data.display,
                valueReference: (value: string) => runInAction(() => this.data.display = (value === "grid") ? value : "inline-grid"),
                options: ["grid", "inline-grid"]
            },
            {
                label: "Columns",
                type: "text",
                value: () => this.data["grid-template-columns"],
                valueReference: (value: string) => runInAction(() => this.data["grid-template-columns"] = value)
            },
            {
                label: "Rows",
                type: "text",
                value: () => this.data["grid-template-rows"],
                valueReference: (value: string) => runInAction(() => this.data["grid-template-rows"] = value)
            },
        ];
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }
}

export const CSSGridContainerModifierDataSchema = createModelSchema(GridContainer, {
    "display": true,
    "grid-template-columns": true
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
