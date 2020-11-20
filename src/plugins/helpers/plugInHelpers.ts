import { IStoryObject } from 'storygraph'
import { IMenuTemplate, IPlugIn } from '../../renderer/utils/PlugInClassRegistry'
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';
import { AbstractStoryObject } from './AbstractStoryObject';

interface IDefaultFieldsMethods {
    updateConnections: (registry: IRegistry, ids: string,  myport: string, theirport: string, direction: "in" | "out") => void
}

interface INameFieldMethods {
    updateName: (name: string) => void
}

// interface IDropDownFieldMethods {
    
// }

export function connectionField(target: IStoryObject & IPlugIn & IDefaultFieldsMethods): IMenuTemplate[] {
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

export function dropDownField(target: AbstractStoryObject): IMenuTemplate[] {
    return [
        {
            label: "Style",
            type: "dropdown",
            value: () => target.renderingProperties.width,
            valueReference: (_class: string) => {target.renderingProperties.width = _class},
            options: ["h1", "h2", "h3", "p", "b"]
        }
    ]
}
