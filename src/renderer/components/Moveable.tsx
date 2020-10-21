import { h } from "preact";
import { IListItem } from "./Toolbar";

export const Moveable = (props: IListItem) => {

    return <button
        class="btn btn-mini btn-default"
        style="position: absolute;"
        onMouseDown={
            function (e: any) {
                e = e || window.event;
                e.preventDefault();

                const x = e.clientX;
                const y = e.clientY;
                const x_0 = e.target.offsetLeft;
                const y_0 = e.target.offsetTop;

                console.log("Click: " + props.name + "@ " + x + "," + y, e.target);

                function updater (move: any) {
                    move.preventDefault();

                    const _x = move.clientX;
                    const _y = move.clientY;
                    const d_x = (_x - x);
                    const d_y = (_y - y);
                    
                    console.log({x: e.target.style.left, dx: d_x, y: e.target.style.top, dy: d_y});

                    e.target.style.left = d_x + x_0;
                    e.target.style.top = d_y + y_0;
                };

                function remover () {
                    document.removeEventListener("mousemove", updater)
                    console.log("drag finished")
                    document.removeEventListener("mouseup", remover);
                };
                
                document.addEventListener("mousemove", updater);
                document.addEventListener("mouseup", remover);
            }
        }
    >{props.name}</button>
}
