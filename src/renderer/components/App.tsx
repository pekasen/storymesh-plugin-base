import { Component, h } from "preact";
import { DropzonePane } from "./DropzonePane";
import { Toolbar } from "./Toolbar";
import { autorun } from "mobx";
import { List } from '..';

interface IAppProps {
    list: List
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
        
        autorun(() => {
            props.list;
            this.forceUpdate();
        });
    }

    public render( { list }: IAppProps, {}) {
        return <div class="window">
            <div class="window-content">
                <div class="pane-group">
                    <div class="pane-sm sidebar">
                        <Toolbar list={list} />
                    </div>
                    <DropzonePane></DropzonePane> 
                </div>

            </div>
        </div>
    }
}

