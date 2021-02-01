import { action, makeObservable, observable, runInAction } from "mobx";
import { h } from "preact";
import { useRef } from "preact/hooks";
import { createModelSchema, list, map, object, primitive } from "serializr";
import { IMenuTemplate } from "../../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../../helpers/exportClass";
import { HMTLModifier } from "../../helpers/HTMLModifier";

class HotSpot {
    public x: number;
    public y: number;

    constructor() {
        this.x = 0.5;
        this.y = 0.5;

        makeObservable(this, {
            x: true,
            y: true,
            updateXY: action
        });
    }

    public updateXY(x?: number, y?: number) {
        if (x) {
            this.x = this._clip(x);
        }
        if (y) {
            this.y = this._clip(y);
        }
    }

    public render(svg: SVGSVGElement): h.JSX.Element | null {
        throw("This method should not be called");
    }

    protected _clip(x: number, min = 0, max = 1) {
        return ((x >= min) ? (x < max) ? x : max : min)
    }
}

class CircleHotSpot extends HotSpot {
    public radius: number;

    constructor() {
        super();

        this.radius = 0.25;
        makeObservable(this, {
            radius: true,
            updateRadius: action
        });
    }

    public updateRadius(radius: number) {
        this.radius = this._clip(radius, 0, Math.PI);
    }

    public render(svg: SVGSVGElement) {
        if (svg) {
            const { width, height } = svg.getBoundingClientRect();

            const relX = width * this.x;
            const relY = height * this.y;
            const relR = Math.sqrt(this.x^2 + this.y^2) * this.radius;
            
            return <circle cx={relX} cy={relY} r={relR}/>
        } else return null
    }
}

class HotSpotModifierData {
    [key: string]: HotSpot[]

    constructor() {
        this.hotspots = [
            new CircleHotSpot()
        ];

        makeObservable(this, {
            hotspots: observable
        })
    }
}
export class HTMLHotSpotModifier extends HMTLModifier {
    public name = "Hot-o-Spot-o"
    public role = "internal.modifier.hotspot";
    public data = new HotSpotModifierData();

    constructor() {
        super();

        makeObservable(this, {
            data: observable,
            addHotSpot: action,
            removeHotSpot: action
        })
    }

    public modify(element: h.JSX.Element): h.JSX.Element {
        // element.props.usemap = `#${this.id}`;
        const svg = useRef<SVGSVGElement>();
        
        return <div id={this.id} class="hotspot-container">
        <svg ref={svg}>
            {this.data.hotspots.map(e => e.render(svg.current))}
        </svg>
        {element}
    </div>;
    }

    public addHotSpot(hotspot: HotSpot): void {
        this.data.hotspots.push(hotspot);
    }

    public removeHotSpot(hotspot: HotSpot): void {
        this.data.hotspots.splice(
            this.data.hotspots.indexOf(hotspot), 1
        )
    }

    public get menuTemplate(): IMenuTemplate[] {
        return [
            ...super.menuTemplate,
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
