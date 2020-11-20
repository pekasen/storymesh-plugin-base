import { remote } from 'electron/renderer';
import { reaction, IReactionDisposer } from 'mobx';
import { Component, h } from 'preact';
import { StoryGraph, IConnectorPort, IEdge } from 'storygraph';
import { RootStore } from '../../store/rootStore';
import { IMenuTemplate } from '../../utils/PlugInClassRegistry';

const { Menu, MenuItem } = remote;

export class ConnectionTableView extends Component<IItemView> {

    reactionDisposer: IReactionDisposer;

    constructor(props: IItemView) {
        super(props);

        this.reactionDisposer = reaction(
            () => props.item.value().connections.length & props.item.value().connectors.length,
            () => this.setState({})
        );
    }

    render({ store, item }: IItemView): h.JSX.Element {
        const myId: string = item.value().id;

        return <div class="form-group-item">
            <label>{item.label}</label>
            <table class="table striped">
                {item.value().connectors.map((port: IConnectorPort) => (<tr
                    onDragOver={(e: DragEvent) => {
                        e.preventDefault();
                    }}
                    onDrop={(e: DragEvent) => {
                        const id = e.dataTransfer?.getData("text");

                        if (id) {
                            const direction = port.direction;
                            const _item = store.storyContentObjectRegistry.getValue(id);

                            if (_item) {
                                const contextMenu = new Menu();
                                _item.connectors
                                    .filter(con => (
                                        con.type === port.type &&
                                        con.direction !== port.direction
                                    ))
                                    .map((_port: IConnectorPort) => (new MenuItem({
                                        label: _port.name,
                                        click: () => {
                                            console.log("add edge to", id + "." + _port.name);
                                            if (item.valueReference) {
                                                item.valueReference(
                                                    store.storyContentObjectRegistry,
                                                    id,
                                                    port.name,
                                                    _port.name,
                                                    direction
                                                );
                                            }
                                        }
                                    })))
                                    .forEach((item: any) => contextMenu.append(item));

                                contextMenu.popup({
                                    window: remote.getCurrentWindow(),
                                    x: e.x,
                                    y: e.y
                                });
                            }
                        }
                    }}>
                    <th><strong>{port.name}</strong></th>
                    {(
                        item
                            .value()
                            .connections as IEdge[])?.filter((edge: IEdge) => (port.direction === "in") ?
                                edge.to.match([myId, port.name].join(".")) :
                                edge.from.match([myId, port.name].join(".")))
                        .map((edge: IEdge) => {
                            return <tr>{(port.direction === "in") ?
                                <td>{store.storyContentObjectRegistry.getValue(StoryGraph.parseNodeId(edge.from)[0])?.name}</td> :
                                <td>{store.storyContentObjectRegistry.getValue(StoryGraph.parseNodeId(edge.to)[0])?.name}</td>}
                            </tr>;
                        })}
                </tr>))}


            </table>
        </div>;
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}

export interface IItemView {
    store: RootStore;
    item: IMenuTemplate;
}
