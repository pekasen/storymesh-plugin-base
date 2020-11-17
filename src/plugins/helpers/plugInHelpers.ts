import { IStoryObject } from 'storygraph'
import { IMenuTemplate, IPlugIn } from '../../renderer/utils/PlugInClassRegistry'
import { IRegistry } from 'storygraph/dist/StoryGraph/IRegistry';

interface IDefaultFieldsMethods {
    updateConnections: (registry: IRegistry, ids: string,  myport: string, theirport: string, direction: "in" | "out") => void
}
export function defaultFields(target: IStoryObject & IPlugIn & IDefaultFieldsMethods): IMenuTemplate[] {
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