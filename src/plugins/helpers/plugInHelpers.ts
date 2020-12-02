import { IMenuTemplate } from '../../renderer/utils/PlugInClassRegistry'
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { AbstractStoryObject } from './AbstractStoryObject';
import { ConnectorDirection, ConnectorPort, ConnectorType } from '../../renderer/utils/ConnectorPort';

interface IDefaultFieldsMethods {
    updateConnections: (registry: IRegistry, ids: string,  myport: string, theirport: string, direction: "in" | "out") => void
}

interface INameFieldMethods {
    updateName: (name: string) => void
}

interface IConnectorMethods {
    addConnector: (type: ConnectorType, dir: ConnectorDirection) => void
    removeConnector: (port: ConnectorPort) => void
}

export function connectionField(target: AbstractStoryObject & IDefaultFieldsMethods): IMenuTemplate[] {
    return [
        {
            label: "Connections",
            type: "table",
            value: () => ({
                connections: target.connections,
                connectors: target.connectors,
                id: target.id
            }),
            valueReference: (registry: IRegistry, id: string, myport: string, theirport: string, direction: "in" | "out") => {target.updateConnections(registry, id, myport, theirport, direction)}
        }
    ]
}

export function addConnectionPortField(target: AbstractStoryObject & IConnectorMethods): IMenuTemplate[] {
    return [
        {
            label: "Add Port",
            type: "button",
            value: () => {
                return target.connectors
            },
            valueReference: (type: ConnectorType, direction: ConnectorDirection) => {
                target.addConnector(type, direction);
            }
        }
    ]
}

export function nameField(target: AbstractStoryObject & INameFieldMethods): IMenuTemplate[] {
    return [
        {
            label: "Name",
            type: "text",
            value: () => target.name,
            valueReference: (name: string) => target.updateName(name)
        }
    ]
}

export function dropDownField(
    target: AbstractStoryObject,
    options: () => string[], //  = ["h1", "h2", "h3", "p", "b"]
    value: () => string,
    handler: (selection: string) => void
    ) : IMenuTemplate[] {
    return [
        {
            label: "Style",
            type: "dropdown",
            value: value,
            valueReference: handler,
            options: options()
        }
    ]
}
