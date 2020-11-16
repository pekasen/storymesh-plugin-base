import { Component, ComponentChildren, FunctionalComponent, h } from 'preact';
import { IReactionDisposer, reaction } from "mobx";
import { UIStore } from '../store/UIStore';
import { useEffect, useState } from 'preact/hooks';
import { PaneProperties } from '../store/PaneProperties';

export const PaneGroup: FunctionalComponent = ({ children }) => (
    <div class="pane-group">{children}</div>
);

export const HorizontalPaneGroup: FunctionalComponent = ({ children }) => (
    <div class="pane-group horizontal-pane-group">{children}</div>
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
    <div class="pane pane-sm sidebar">{children}<div class="drag-handle-horizontal"></div></div>
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

export interface IResizablePaneProps {
    children: ComponentChildren
    resizable: "none" | "left" | "right"
    paneState: PaneProperties
    classes?: string[]
}

export const ResizablePane: FunctionalComponent<IResizablePaneProps> = ({children, resizable, paneState, classes}: IResizablePaneProps) => {
    const [_, setState] = useState({});
    const _classes = classes || [];


    if (resizable !== "none" && paneState) {
        useEffect(() => {
            const disposer = reaction(
                () => ([paneState?.width, paneState.hidden]),
                () => {
                    setState({});
                }
            )
    
            return () => {
                disposer();
            }
        });

        const cache = {
            x: 0
        };    

        return <div class={["pane", "pane-resizable", (paneState.hidden) ? " hidden" : "visible", ..._classes].join(" ")} style={`width: ${paneState?.width}`}>
            {children}
            <div
            class={`drag-handle-horizontal-${(resizable === "left") ? "left" : "right"}`}
            onMouseDown={(e: MouseEvent) => {
                
                const updater = (f: MouseEvent) => {
                    // mouse position
                    const x =  - cache.x;
                    // element position
                    const rectX = (f.target as HTMLElement).getBoundingClientRect().x;
                    cache.x
                    console.log("Bounds", (f.target as HTMLElement).getBoundingClientRect());

                    paneState.setWidth(-f.movementX + paneState.width);


                };
                const remover = () => {
                    document.removeEventListener("mousemove", updater);
                    document.removeEventListener("mouseup", updater);
                };

                document.addEventListener("mousemove", updater);
                document.addEventListener("mouseup", remover);
                
            }}></div>
        </div>
    }
    else return <div class="pane">{children}</div>
}