import { IConnectorPort, StoryGraph } from 'storygraph';
import { AbstractStoryObject } from "./helpers/AbstractStoryObject";
import { h } from "preact";
import { IMenuTemplate } from '../renderer/utils/PlugInClassRegistry';
import { connectionField, nameField } from './helpers/plugInHelpers';
import { exportClass } from './helpers/exportClass';
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { action, makeObservable, observable } from 'mobx';

class _CameraView extends AbstractStoryObject {
    public content: any;
    public childNetwork: undefined;
    public name: string;
    public role = "internal.content.cameraview";
    public isContentNode = true;
    public userDefinedProperties: any;
    public connectors: IConnectorPort[];
    public icon: string;
    public menuTemplate: IMenuTemplate[];
    public cameraId: string;
    static defaultIcon = "icon-camera";

    constructor() {
        super();
        this.name = "Camera View";
        this.icon = _CameraView.defaultIcon;
        this.connectors = [
            {
                name: "data-in",
                type: "data",
                direction: "in"
            },
            {
                name: "flow-in",
                type: "flow",
                direction: "in"
            },
            {
                name: "flow-out",
                type: "flow",
                direction: "out"
            }
        ];
        this.menuTemplate = [
           ...nameField(this),
           ...connectionField(this)
        ];
        this.cameraId = "";

        makeObservable(this, {
            name: observable,
            updateName: action
        });
    }

    public pullData(registry: IRegistry): any {
        // get parent network
        const port = this.getPort(registry);
        if (port && port.call) return port.call();
    }


    public updateName(name: string) {
        this.name = name;
    }

    public getComponent() {

        return () => <div></div>
    }

    public getEditorComponent() {
        return () => <div></div>
    }

    private getPort(registry: IRegistry) {
        if (this.connections.length >= 0) {
            // get data edges for this node
            const incoming = this.connections.
                filter(edge => {
                    const [id, port]: string[] = StoryGraph.parseNodeId(edge.to);
                    return port.startsWith("data") && id === this.id;
                });
            // pull data from their scene
            if (incoming.length !== 1)
                throw ("This should not have happened.");

            const fromNode = registry.getValue(incoming[0].from);
            const [_, port] = StoryGraph.parseNodeId(incoming[0].from);

            const _port = fromNode?.connectors.filter(con => {
                con.name === port;
            })[0];

            if (_port)
                return _port
        } else return;
    }
}

export const plugInExport = exportClass(
    _CameraView,
    "Camera View",
    "internal.content.cameraview",
    _CameraView.defaultIcon,
    true
);
