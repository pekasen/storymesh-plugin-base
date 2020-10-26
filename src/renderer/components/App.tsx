import { Component, h } from "preact";
import { DropzonePane } from "./DropzonePane";
import { Toolbar } from "./Toolbar";
import { autorun } from "mobx";
import { List, UIStore } from '..';

interface IAppProps {
    list: List
    uistate: UIStore
}

// export const App = ({ list }: IAppProps) => (
//     <div class="window">
//         <div class="window-content">
//             <div class="pane-group">
//                 <div class="pane-sm sidebar">
//                     <Toolbar />
//                 </div>
//                 <DropzonePane></DropzonePane> 
//             </div>
//         </div>
//     </div>
// );

export class App extends Component<IAppProps,{}> {

    constructor (props: IAppProps) {
        super(props);
    }

    public render( { list, uistate }: IAppProps, {}) {
        console.log("rerender", this);

        return <div class="window">
            <div class="window-content">
                <div class="pane-group">
                    <div class="pane-sm sidebar">
                        <Toolbar list={list} uistate={uistate} />
                    </div>
                    <DropzonePane uistate={uistate}></DropzonePane> 
                </div>

            </div>
        </div>
    }
}

