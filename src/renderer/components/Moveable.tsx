import { Component, h } from "preact";
import { observable, makeObservable, action, autorun, observe } from "mobx";
import { UIStore } from '..';

export class MoveableItem {

    public name: string
    public x: number
    public y: number

    constructor (name: string, x: number, y: number) {
        this.name = name;
        this.x = x;
        this.y = y;

        makeObservable(this, {
            name: observable,
            x: observable,
            y: observable,
            updatePosition: action
        });
    }

    updatePosition (x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    updateName (name: string) {
        this.name = name;
    }
}

interface IMoveableState {
    coordinates: {
        x: number,
        y: number
    }
}

interface IMoveableProps {
    item: MoveableItem
    children: preact.JSX.Element
}

export const Moveable = ({ item, children }: IMoveableProps) => (
    <div
        style={
            "position: absolute;" +
            (item.x === 0 ? "" : `left: ${item.x};`) +
            (item.y === 0 ? "" : `top: ${item.y};`)
        }
        onMouseDown={
            (e: any) => {
                e = e || window.event;
                e.preventDefault();

                const x = e.clientX;
                const y = e.clientY;
                const x_0 = item.x;
                const y_0 = item.y;

                function updater (move: any) {
                    move.preventDefault();

                    const _x = move.clientX;
                    const _y = move.clientY;
                    const d_x = (_x - x);
                    const d_y = (_y - y);
                    
                    // console.log({x: e.target.style.left, dx: d_x, y: e.target.style.top, dy: d_y});

                    item.updatePosition(
                        d_x + x_0,
                        d_y + y_0
                    );
                };

                function remover () {
                    document.removeEventListener("mousemove", updater)
                    console.log("drag finished")
                    document.removeEventListener("mouseup", remover);
                };
                
                document.addEventListener("mousemove", updater);
                document.addEventListener("mouseup", remover);
            }
        }>{children}</div>
);

// export class Moveable extends Component<IMoveableProps, IMoveableState> {

//     state: IMoveableState;

//     constructor(props: IMoveableProps) {
//         super(props);

//         autorun(() => {
//             props.uistate.moveableItems;
//             this.forceUpdate();
//         });
//     }

//     render ({ uistate, children }: IMoveableProps , state: IMoveableState) { 
            // return <div
            //     style={
            //         "position: absolute;" +
            //         (state.coordinates.x === 0 ? "" : `left: ${state.coordinates.x};`) +
            //         (state.coordinates.y === 0 ? "" : `top: ${state.coordinates.y};`)
            //     }
            //     onMouseDown={
            //         (e: any) => {
            //             var that = this;

            //             e = e || window.event;
            //             e.preventDefault();

            //             const x = e.clientX;
            //             const y = e.clientY;
            //             const x_0 = state.coordinates.x;
            //             const y_0 = state.coordinates.y;

            //             function updater (move: any) {
            //                 move.preventDefault();

            //                 const _x = move.clientX;
            //                 const _y = move.clientY;
            //                 const d_x = (_x - x);
            //                 const d_y = (_y - y);
                            
            //                 console.log({x: e.target.style.left, dx: d_x, y: e.target.style.top, dy: d_y});

            //                 that.setState({
            //                     coordinates: {
            //                         x: d_x + x_0,
            //                         y: d_y + y_0
            //                     }
            //                 })

            //                 uistate.moveableItems
            //             };

            //             function remover () {
            //                 document.removeEventListener("mousemove", updater)
            //                 console.log("drag finished")
            //                 document.removeEventListener("mouseup", remover);
            //             };
                        
            //             document.addEventListener("mousemove", updater);
            //             document.addEventListener("mouseup", remover);
            //         }
            //     }>{...children}</div>
//     }

//     shouldComponentUpdate(nextProps: IMoveableProps, nextState: IMoveableState) {
//         return this.state !== nextState
//     }
// }
