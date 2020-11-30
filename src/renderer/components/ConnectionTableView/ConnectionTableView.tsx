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
            () => [props.item.value().connections.length, props.item.value().connectors.length],
            () => this.setState({})
        );
    }

    render({ store, item }: IItemView): h.JSX.Element {
        const myId: string = item.value().id;
        const connections = (item.value().connections as IEdge[]);

        return <div class="form-group-item">
            <label>{item.label}</label>
            <table class="connection-table">
                <thead>
                    <tr>
                        <th>Port</th>
                        <th>Object</th>
                    </tr>
                </thead>
                <tbody>
                {
                    (item.value().connectors) ? Array.from(item.value().connectors as Map<string, IConnectorPort>).map((input) => {
                        const [key, port] = input;
                        
                        const portCons = connections?.filter(
                            (edge: IEdge) => (port.direction === "in") ?
                                edge.to.match([myId, port.name].join(".")) :
                                edge.from.match([myId, port.name].join(".")
                            )
                        );

                        const onDropOnTableRow = (e: DragEvent) => {
                            const id = e.dataTransfer?.getData("text");

                            if (id) {
                                const direction = port.direction;
                                const _item = store.storyContentObjectRegistry.getValue(id);

                                if (_item) {
                                    const contextMenu = new Menu();

                                    _item.connectors.forEach(con => {
                                        if (con.type === port.type &&
                                            con.direction !== port.direction) {
                                                contextMenu.append(
                                                    new MenuItem({
                                                        label: con.name,
                                                        click: () => {
                                                            console.log("add edge to", id + "." + con.name);
                                                            if (item.valueReference) {
                                                                item.valueReference(
                                                                    store.storyContentObjectRegistry,
                                                                    id,
                                                                    port.name,
                                                                    con.name,
                                                                    direction
                                                                );
                                                            }
                                                        }
                                                    })
                                                );
                                            }
                                    })

                                    contextMenu.popup({
                                        window: remote.getCurrentWindow(),
                                        x: e.x,
                                        y: e.y
                                    });
                                }
                            }
                        };

                        const edgeCells = portCons.map((edge: IEdge) => {
                                const fromName = store.storyContentObjectRegistry.getValue(StoryGraph.parseNodeId(edge.from)[0])?.name || "";
                                const toName = store.storyContentObjectRegistry.getValue(StoryGraph.parseNodeId(edge.to)[0])?.name || "";

                                return <td>{(port.direction === "in") ? fromName : toName}</td>
                        });

                        if (edgeCells.length >= 1) {
                            return edgeCells.map((edgecell, index) => (
                                <tr onDragOver={(e: DragEvent) => {e.preventDefault()}} onDrop={onDropOnTableRow} >
                                {
                                    (index === 0) ? <th class={port.type} rowSpan={edgeCells.length}>{port.name}</th> : undefined
                                }
                                {
                                    edgecell
                                }
                            </tr>
                            ))
                        } else return <tr onDragOver={(e: DragEvent) => {e.preventDefault()}} onDrop={onDropOnTableRow} >
                            <th class={port.type}>{port.name}</th>
                            <td></td>
                        </tr>
                    }) : null
                }
                </tbody>
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
