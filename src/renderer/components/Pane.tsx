import { FunctionalComponent, h } from 'preact';

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
