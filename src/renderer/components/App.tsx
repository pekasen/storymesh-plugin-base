import { reaction } from 'mobx';
import { Component, h } from "preact";
import { model } from '..';
import { List } from "../store/List";

import { UIStore } from "../store/UIStore";

import { DropzonePane } from "./DropzonePane";
import { Header } from './Header';
import { Toolbar } from "./Toolbar";
import { Window } from "./Window";

interface IAppProps {
    list: List
    uistate: UIStore
}

export class App extends Component<IAppProps> {

    constructor (props: IAppProps) {
        super(props);

        reaction(
            () => ({
                file: props.uistate.file,
                sidebar: props.uistate.leftSidebar,
                hidden: props.uistate.leftSidebar
            }),
            () => {
                this.setState({});
        });
    }

    public render({ list, uistate }: IAppProps): h.JSX.Element {
        return <Window>
                <Header
                    title={uistate.windowProperties.title}
                    leftToolbar={[
                    <button class="btn btn-default"
                        onClick={() =>{
                            uistate.toggleSidebar();
                        }}>
                        <span class="icon icon-left-dir"></span>
                    </button>]}
                ></Header>
                <div class="window-content">
                    <div class="pane-group">
                        <Toolbar list={list} uistate={uistate} hidden={uistate.leftSidebar}/>
                        <DropzonePane uistate={uistate} model={model}></DropzonePane> 
                    </div>
                </div>
                <footer class="toolbar toolbar-footer"></footer>
        </Window>
    }
}

