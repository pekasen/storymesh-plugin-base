import { makeObservable, observable, runInAction } from "mobx";
import { h } from "preact";
import { createModelSchema, list, map, object, primitive } from "serializr";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";

export class HTMLHotSpotModifier extends HMTLModifier {
    public name = "Hot-o-Spot-o"
    public role = "internal.modifier.hotspot";

    constructor() {
        super();

        makeObservable(this, {
            data: observable
        })
    }

    public modifyHTML(element: h.JSX.Element): h.JSX.Element {
        element.props.usemap = `#${this.id}`;



        return <div >
            {element}

        </div>;
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
        ];
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }
}

// export const GridItemInlineStatementsSchema = createModelSchema(GridItemInlineStatements, {
//     "grid-row": true,
//     "grid-column": true
// })

// export const CSSGriditemModifierDataSchema = createModelSchema(GridItem, {
//     classes: list(primitive()),
//     data: object(GridItemInlineStatements),
//     classMap: map(primitive())
// });

// export const CSSGriditemModifierSchema = createModelSchema(CSSGriditemModifier, {
//     data: object(CSSGriditemModifierDataSchema)
// });

export const plugInExport = exportClass(
    HTMLHotSpotModifier,
    "HotSpot",
    "internal.modifier.hotspot",
    "icon-speaker",
    true
);
