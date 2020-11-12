import { Component, FunctionalComponent, h } from 'preact';
import { IReactionDisposer, reaction } from "mobx";
import { UIStore } from '../store/UIStore';

export const PaneGroup: FunctionalComponent = ({ children }) => (
    <div class="pane-group">{children}</div>
);

export const Pane: FunctionalComponent = ({ children }) => (
    <div class="pane">{children}</div>
);

export const SmallPane: FunctionalComponent = ({ children }) => (
    <div class="pane pane-sm">{children}</div>
);

/**
 * Renders a Mac OS styled small sidebar
 * 
 * @param props.children Preact elements to enclose  
 * @returns {h.JSX.Element} A Peact Component
 */
export const SideBar: FunctionalComponent = ({ children }) => (
    <div class="pane pane-sm sidebar">{children}</div>
);

export interface IHideable {
    // hidden: boolean
    uistate: UIStore
    children: h.JSX.Element
}

export class HiddeableSideBar extends Component<IHideable> {

    reactionDisposer: IReactionDisposer

    constructor(props: IHideable) {
        super(props);

        this.reactionDisposer = reaction(
            () => (props.uistate.hideLeftSidebar),
            () => {
                this.setState({});
            }
        )
    }

    render({uistate, children}: IHideable): h.JSX.Element {
        return <div class={"pane pane-sm sidebar" + ((uistate.hideLeftSidebar) ? " hidden" : "")}>
            {children}
        </div>
    }

    componentWillUnmount(): void {
        this.reactionDisposer();
    }
}