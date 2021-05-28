import Logger from "js-logger";
import { action, computed, makeObservable, runInAction } from "mobx";
import { Fragment, h } from "preact";
import { Button, Display, IColumnSpecification, MenuTemplate, Table, Text } from "preact-sidebar";
import { createModelSchema, list, object, primitive } from "serializr";
import { FlowConnectorInPort, FlowConnectorOutPort, ReactionConnectorInPort } from "storygraph";
import { ConnectorSchema } from "../../renderer/store/schemas/ConnectorSchema";
import { StoryObject } from "../helpers/AbstractStoryObject";
import { exportClass } from "../helpers/exportClass";
import { nameField, connectionField } from "../helpers/plugInHelpers";

export class Branch extends StoryObject {
    public name = "Branch";
    public isContentNode = true;
    public role = "internal.content.branch";
    public icon = "icon-switch";
    public activeConnector = 1;
    public deletable = true;
    private _outConnectors = [
       [ new FlowConnectorOutPort(), new ReactionConnectorInPort("out1", () => this._switchConnectors(0))],
        [new FlowConnectorOutPort(),  new ReactionConnectorInPort("out1", () => this._switchConnectors(1))]
    ];
    private _flowInConnector = new FlowConnectorInPort();

    constructor() {
        super();
        makeObservable(
            this, {
                activeConnector: false,
                numConnectors: computed,
                addConnector: action,
                removeConnector: action,
                updateName: action
            }
        );
    }

    get menuTemplate() {
        const ret: MenuTemplate[] = [
            ...nameField(this),
            new Table<FlowConnectorOutPort>(
                "Connectors",
                {
                    columns: [
                        // {
                        //     name: "ID",
                        //     property: "id",
                        //     editable: false,
                        //     type: (arg: FlowConnectorOutPort, spec) => (
                        //         new Display("", () => arg.id)
                        //     )
                        // },
                        // TODO: Here's still a bug that prevents the connectors name of beinging set
                        {
                            name: "Name",
                            property: "name",
                            editable: false,
                            type: (arg, spec) => {
                                return new Text("", { defaultValue: "" }, () => arg.name, (name) => runInAction(() => arg.name = name))
                            },
                            // setter: (arg, property, value) => {
                            //     if (typeof arg === "string" && property === "name") {
                            //         value.name = arg;
                            //     }
                            // }
                        },
                        {
                            name: "Delete",
                            property: "id",
                            editable: false,
                            type: (arg) => (
                                new Button("delete", () => this.removeConnector(arg))
                            )
                        }
                    ]
                },
                () => this._outConnectors.map(e => e[0]) as FlowConnectorOutPort[]
            ),
            new Button("add Connector", () => this.addConnector()),
            ...connectionField(this)
        ];
        if (super.menuTemplate) ret.push(...super.menuTemplate);
        return ret;
    }

    get connectors() {
        // get empty map
        const sup = super.connectors;
        // set input
        sup.set(this._flowInConnector.id, this._flowInConnector);
        // set outputs
        this._outConnectors.forEach(pack => {
            pack.forEach(con => {
                sup.set(con.id, con);
            })
        });
        // return assembled map
        return sup;
    }

    get numConnectors() {
        return this._outConnectors.length;
    }

    public addConnector() {
        const newOne = [new FlowConnectorOutPort(), new ReactionConnectorInPort("reaction-in", () => this._switchConnectors(this.numConnectors))];
        this._outConnectors.push(newOne);
    }

    public removeConnector(connector: FlowConnectorOutPort) {
        this.logger.warn("Removing connector", this);
        const index = this._outConnectors.map(e => e[0]).indexOf(connector);
        if (index !== -1) {
            this._outConnectors.splice(index, 1);
        }
    }

    public updateName(name: string) {
        this.name = name;
    }

    private _switchConnectors(index: number) {
        if (
            index >= 0 &&
            index < this.numConnectors
        ) {
            this.activeConnector = index + 1;

            const _in = this._flowInConnector;
            const _out = this._outConnectors[this.activeConnector - 1][0] as FlowConnectorOutPort;
            _in.associated = _out.id;
            _out.associated = _in.id;

            Logger.info("set port association for", _in, _out);
            this.notificationCenter?.push(this.parent+"/rerender");
        }
    }

    getComponent() {
        return () => <Fragment></Fragment>
    }
}

createModelSchema(Branch, {
    _outConnectors: list(list(object(ConnectorSchema))),
    _flowInConnector: object(ConnectorSchema),
    activeConnector: primitive()
});

export const plugInExport = exportClass(
    Branch,
    "Branch",
    "internal.content.branch",
    "icon-switch",
    true
);
