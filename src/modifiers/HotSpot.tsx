import { action, makeObservable, observable, runInAction } from "mobx";
import { Component, createRef, h, RefObject } from "preact";
import { createModelSchema, list, object } from "serializr";
import { ReactionConnectorOutPort, IConnectorPort, ConnectorSchema, exportClass, HTMLModifier, ModifierPlugIn } from "storygraph";
import { Button, HSlider, MenuTemplate, Table } from "preact-sidebar";
export class HotSpot {
    protected _name: string | undefined;    
    public x: number;
    public y: number;
    public reactionOut = new ReactionConnectorOutPort("reaction-out");
    public debug = false;
    protected static numOfInstances = 1;

    constructor(x?: number, y?: number) {
        this.x = x ?? 0.5;
        this.y = y ?? 0.5;
        HotSpot.numOfInstances += 1;

        makeObservable(this, {
            x: true,
            y: true,
            debug: true,
            updateXY: action
        });
    }

    public updateXY(x?: number, y?: number): void {
        if (x) {
            this.x = this._clip(x);
        }
        if (y) {
            this.y = this._clip(y);
        }
    }

    public render(svg?: RefObject<SVGSVGElement>): preact.JSX.Element {
        throw("This method should not be called");
    }

    protected _clip(x: number, min = 0, max = 1): number {
        return ((x >= min) ? (x < max) ? x : max : min)
    }

    public get(property: string): string | number | undefined {
        switch (property) {
            case "x": return this.x;
            case "y": return this.y;
            case "name": return this.name;
            default: break;
        }
    }

    public get name(): string {
        return `${this._name}${(HotSpot.numOfInstances > 0) ? "-" + HotSpot.numOfInstances : ""}`
    }

    public set name(name: string) {
        this._name = name
    }
}

class CircleHotSpot extends HotSpot {
    public radius: number;
    protected _num: number;
    
    public get name() {
        if (this._name === undefined) return "CircleHotSpot" + this._num;
        else return this._name;
    }

    public set name(name: string) {
        this._name = name;
    }

    constructor(x?:number, y?: number, r?: number) {
        super(x, y);
        this._num = CircleHotSpot.numOfInstances;
        CircleHotSpot.numOfInstances += 1;

        this.radius = r ?? 0.25;
        makeObservable(this, {
            radius: true,
            updateRadius: action
        });
    }

    public updateRadius(radius: number) {
        this.radius = this._clip(radius, 0, Math.PI);
    }

    public render(svg?: RefObject<SVGSVGElement>): preact.JSX.Element {
        if (svg?.current) {
            const { width, height } = svg.current.getBoundingClientRect();

            const relX = width * this.x;
            const relY = height * this.y;
            const relR = Math.sqrt(width * width + height * height) * this.radius;
            
            return <circle class={(this.debug) ? "debug" : undefined} cx={relX} cy={relY} r={relR} onClick={() => {
                this.reactionOut.notify();
            }}/>
        } else return <circle />
    }
    
    public get(property: string): string | number | undefined {
        switch (property) {
            case "radius": return this.radius;
            default: return super.get(property);
        }
    }
}

class HotSpotModifierData {
    [key: string]: HotSpot[];
    hotspots: HotSpot[];

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
export class HTMLHotSpotModifier extends HTMLModifier {
    public name = "Hot-o-Spot-o"
    public role = "internal.modifier.hotspot";
    public data = new HotSpotModifierData();

    constructor() {
        super();

        makeObservable(this, {
            data: observable,
            addHotSpot: action,
            removeHotSpot: action
        });
    }

    public modify(element: h.JSX.Element): h.JSX.Element {
        // Hacky this/that trick
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        class SVGOverlay extends Component {
            svgRef = createRef();
            hotspots: preact.JSX.Element[] = [];
            
            render() {
                return <svg id={that.id} ref={this.svgRef}>
                    {this.hotspots}
                </svg>
            }

            componentDidMount(){
                this.updateHotSpots();
                this.forceUpdate();
            }

            private updateHotSpots() {
                if (this.svgRef.current) {
                    this.hotspots = that.data.hotspots.map(e => e.render(this.svgRef));
                }
            }

            componentWillUpdate() {
                this.updateHotSpots();
            }
        }

        return <div id={that.id} class="hotspot-container">
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

    public get menuTemplate(): MenuTemplate[] {
        return [
            ...super.menuTemplate,
            new Table<CircleHotSpot>(
                "Hotspots",
                {
                    columns: [
                        {
                            name: "Name",
                            type: "",
                            editable: true,
                            property: "name",
                            setter: (arg, property, value: HotSpot) => {
                                runInAction(() => {
                                    if (typeof arg === "string") {
                                        value.name = arg;
                                    }
                                });
                            }
                        },
                        {
                            name: "X",
                            type: (arg, spec) => {
                                return new HSlider(
                                    "",
                                    {
                                        min:0,
                                        max: 100,
                                        formatter: (x) => `${x}%`
                                    },
                                    () => arg.x * 100,
                                    (x) => {
                                        if (spec.setter) {
                                            spec.setter(x / 100, "x", arg)
                                        }
                                    }
                                );
                            },
                            editable: true,
                            property: "x",
                            setter: (arg, property, value: HotSpot) => {
                                runInAction(() => {
                                    if (typeof arg === "number") {
                                        value.x = arg;
                                    }
                                });
                            }
                        },
                        {
                            name: "Y",
                            type: (arg, spec) => {
                                return new HSlider(
                                    "",
                                    {
                                        min:0,
                                        max: 100,
                                        formatter: (x) => `${x}%`
                                    },
                                    () => arg.y * 100,
                                    (y) => {
                                        if (spec.setter) {
                                            spec.setter(y / 100, "y", arg)
                                        }
                                    }
                                );
                            },
                            editable: true,
                            property: "y",
                            setter: (arg, property, value: HotSpot) => {
                                runInAction(() => {
                                    if (typeof arg === "number") {
                                        value.y = arg;
                                    }
                                });
                            }
                        },
                        {
                            name: "Radius",
                            type: (arg, spec) => {
                                return new HSlider(
                                    "",
                                    {
                                        min:0,
                                        max: 100,
                                        formatter: (x) => `${x}%`
                                    },
                                    () => arg.x * 100,
                                    (x) => {
                                        if (spec.setter) {
                                            spec.setter(x / 100, "x", arg)
                                        }
                                    }
                                );
                            },
                            editable: true,
                            property: "radius",
                            setter: (arg, property, value) => {
                                runInAction(() => {
                                    if (typeof arg === "number") {
                                        value.radius = arg;
                                    }
                                });
                            }
                        },
                        {
                            "name": "Delete",
                            property: "get",
                            type: (arg, spec) => {
                                return new Button("Delete", () => this.removeHotSpot(arg));
                            },
                            editable: false
                        }
                    ]
                },
                () => this.data.hotspots as CircleHotSpot[]
            ),
            new Button("Add HotSpot", () => this.addHotSpot(new CircleHotSpot())),
            new Button("Toggle Vis.", () => {
                runInAction(() => {
                    this.data.hotspots.forEach(e => e.debug = !e.debug);
                });
            })
        ];
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }

    // TODO: reaction outputs are not deleted if HotSpot is deleted
    public requestConnectors(): [string, IConnectorPort][] {
        return this.data.hotspots.map((value) => {
            const out = value.reactionOut
            out.name = value.name;
            return [out.id, out];
        });
    }
}

export const HotSpotSchema = createModelSchema(HotSpot, {
    x: true,
    y: true,
    name: true,
    reactionOut: object(ConnectorSchema)
});

export const CircleHotSpotSchema = createModelSchema(CircleHotSpot, {
    radius: true
});

export const HotSpotModifierDataSchema = createModelSchema(HotSpotModifierData, {
    hotspots: list(object(CircleHotSpotSchema))
});

export const HTMLHotSpotModifierSchema = createModelSchema(HTMLHotSpotModifier, {
    data: object(HotSpotModifierData),
    name: true,
    role: true
});

export const plugInExport = exportClass(
    HTMLHotSpotModifier,
    "HotSpot",
    "internal.modifier.hotspot",
    "icon-speaker",
    true
);

export const HotSpotPlugIn: ModifierPlugIn = {
    name: "HotSpot",
    id: "internal.modifier.hotspot",
    constructor: HotSpot
}
