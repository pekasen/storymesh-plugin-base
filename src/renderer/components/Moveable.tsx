import { Component, h } from "preact";

interface IMoveableState {
    coordinates: {
        x: number,
        y: number
    }
}

interface IMoveableProps {
    x: number, y: number, children?: any
}
export class Moveable extends Component<IMoveableProps, IMoveableState> {

    state: IMoveableState;

    constructor(props: IMoveableProps) {
        super(props);

        this.state = {
            coordinates: {
                x: props.x || 0,
                y: props.y || 0
            }
        }
    }

    render (props: IMoveableProps , state: IMoveableState) { 
            return <div
                style={
                    "position: absolute;" +
                    (state.coordinates.x === 0 ? "" : `left: ${state.coordinates.x};`) +
                    (state.coordinates.y === 0 ? "" : `top: ${state.coordinates.y};`)
                }
                onMouseDown={
                    (e: any) => {
                        var that = this;

                        e = e || window.event;
                        e.preventDefault();

                        const x = e.clientX;
                        const y = e.clientY;
                        const x_0 = state.coordinates.x;
                        const y_0 = state.coordinates.y;

                        function updater (move: any) {
                            move.preventDefault();

                            const _x = move.clientX;
                            const _y = move.clientY;
                            const d_x = (_x - x);
                            const d_y = (_y - y);
                            
                            console.log({x: e.target.style.left, dx: d_x, y: e.target.style.top, dy: d_y});

                            that.setState({
                                coordinates: {
                                    x: d_x + x_0,
                                    y: d_y + y_0
                                }
                            })
                        };

                        function remover () {
                            document.removeEventListener("mousemove", updater)
                            console.log("drag finished")
                            document.removeEventListener("mouseup", remover);
                        };
                        
                        document.addEventListener("mousemove", updater);
                        document.addEventListener("mouseup", remover);
                    }
                }>{...props.children}</div>
    }

    shouldComponentUpdate(nextProps: IMoveableProps, nextState: IMoveableState) {
        return this.state !== nextState
    }
}
