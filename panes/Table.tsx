import { reaction, runInAction } from "mobx";
import { h, JSX } from "preact";
import { useEffect, useState } from "preact/hooks";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";
import { exportClass } from "../helpers/exportClass";
import { IMenuItemRenderer } from "../helpers/IMenuItemRenderer";
import { HotSpot } from "../modifiers/HotSpot";

interface IColumnSpecification {
    name: string
    type: string
    editable: boolean
    property: string | ((e: HotSpot) => void)
}

interface ITableOptions {
    columns: IColumnSpecification[];
}

export class HotSpotTableMenuItem implements IMenuItemRenderer {
    render(item: IMenuTemplate<HotSpot[], ITableOptions>): JSX.Element {
        // const [, setState] = useState({});

        // useEffect(() => {
        //     const reactionDisposer = reaction(
        //         () => {
        //             return [...item.value()]
        //         },
        //         () => setState({})
        //     );

        //     return () => {
        //         reactionDisposer();
        //     };
        // });

        return <div class="form-group-item">
            <label>HotSpots</label>
            <table>
                <thead>
                    <tr>
                        {
                            item.options?.columns.map(column => (
                                <th>{column.name}</th>
                            ))
                        }
                    </tr>
                </thead>
                <tbody>
                {
                    item.value().map((e: HotSpot) => {
                        return <tr>
                            {
                                item.options?.columns.map(column => {
                                    if (typeof column.property === "string") {
                                        const val = e.get(column.property);

                                        return <td contentEditable={column.editable} onInput={(event: Event) =>{
                                            if (column.editable) {
                                                runInAction(() => {
                                                    e[column.property] = (event.target as HTMLTableDataCellElement).innerHTML;
                                                });
                                            }
                                        }}>{val}</td>
                                    } else if (typeof column.property !== "string") {
                                        const cb = column.property;
                                        if (column.type === "button") {
                                            return <td>
                                                <button onClick={() => {cb(e)}}>{column.name}</button>
                                            </td>
                                        }
                                        if (column.type === "slider") {
                                            return <td>
                                                <input type="slider"></input>
                                            </td>
                                        }
                                    }
                                })
                            }
                        </tr>             
                    })
                }
                </tbody>
            </table>
        </div>
    }
}

export const plugInExport = exportClass(
    HotSpotTableMenuItem,
    "",
    "internal.pane.hotspot-table",
    "",
    false
);
