import { action, makeObservable, observable, runInAction } from "mobx";
import { Component, createRef, h } from "preact";
import { useRef } from "preact/hooks";
import { createModelSchema, list, map, object, primitive } from "serializr";
import { ConnectorPort, IConnectorPort } from "storygraph";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { HMTLModifier } from "../helpers/HTMLModifier";

class HotSpot {
    public x: number;
    public y: number;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0.5;
        this.y = y ?? 0.5;

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

    public render(svg: Element): preact.JSX.Element {
        throw("This method should not be called");
    }

    protected _clip(x: number, min = 0, max = 1) {
        return ((x >= min) ? (x < max) ? x : max : min)
    }
}

class CircleHotSpot extends HotSpot {
    public radius: number;

    constructor(x?:number, y?: number, r?: number) {
        super(x, y);

        this.radius = r ?? 0.25;
        makeObservable(this, {
            radius: true,
            updateRadius: action
        });
    }

    public updateRadius(radius: number) {
        this.radius = this._clip(radius, 0, Math.PI);
    }

    public render(svg?: Element): preact.JSX.Element {
        if (svg) {
            const { width, height } = svg.getBoundingClientRect();

            const relX = width * this.x;
            const relY = height * this.y;
            const relR = Math.sqrt(relX * relX + relY * relY) * this.radius;

            console.log("circle dims", {x: relX, y: relY, r: relR});
            
            return <circle cx={relX} cy={relY} r={relR} onClick={() => console.log("Hello from Circle")}/>
        } else return <circle />
    }
}

class HotSpotModifierData {
    [key: string]: HotSpot[]

    constructor() {
        this.hotspots = [
            new CircleHotSpot(),
            new CircleHotSpot(0.9, 0.9, 0.1),
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
        // TODO: svgOverlay should be the same size as the passed element
        // element.props.usemap = `#${this.id}`;
        const sizeRef = useRef();
        element.props.ref = sizeRef;
        
        // if (svgRef.current) {
        //     console.log("children", this.data.hotspots)
        //     svg.props.children = this.data.hotspots.map(e => e.render(svgRef.current));
        // }

        // Hacky this/that trick
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        class SVGOverlay extends Component {
            svgRef = createRef();
            hotspots: preact.JSX.Element[] = [];
            
            render() {
                return <svg id={that.id} class={"hotspot-overlay"} ref={this.svgRef}>
                    {this.hotspots}
                </svg>
            }

            componentDidMount(){
                if (this.svgRef.current) {
                    this.hotspots = that.data.hotspots.map(e => e.render(this.svgRef.current));
                    this.forceUpdate();
                }
            }
        }

        return <div id={this.id} style="position: relative;">
            {/* <svg id={this.id} class={"hotspot-overlay"}>
                {this.data.hotspots.map(e => e.render(sizeRef.current))}
            </svg> */}
            <SVGOverlay />
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
    public requestConnectors(): [string, IConnectorPort][] {
        return this.data.hotspots.map((value, index) => {
                return [
                    `reaction-out-${index}`,
                    new ConnectorPort("reaction", "out")
                ]
        });
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
