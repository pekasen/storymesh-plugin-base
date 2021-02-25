import { h, FunctionalComponent } from 'preact';

/**
 * Creates a vertical pane group
 * 
 * @param {ComponentProps} props Props passed to the component
 * @returns {Element} Preact Element
 */
export const VerticalPaneGroup: FunctionalComponent = ({children}) => (
    <div class="vertical-pane-group">{children}</div>
)

/**
 * Creates a vertical pane
 * 
 * @param {ComponentProps} props Props passed to the component
 * @returns {Element} Preact Element
 */
export const VerticalPane: FunctionalComponent = ({children}) => (
    <div class="vertical-pane">{children}</div>
)

/**
 * Creates a small fix-height vertical pane
 * 
 * @param {ComponentProps} props Props passed to the component
 * @returns {Element} Preact Element
 */
export const VerticalSmallPane: FunctionalComponent = ({children}) => (
    <div class="vertical-pane vertical-pane-sm">{children}</div>
)

/**
 * Creates a vertical pane with variable height and visible overflow
 * 
 * @param {ComponentProps} props Props passed to the component
 * @returns {Element} Preact Element
 */
export const VerticalFlexPane: FunctionalComponent = ({children}) => (
    <div class="vertical-pane vertical-pane-flex">{children}</div>
)

/**
 * Creates a minituare flexible vertical pane
 * 
 * @param {ComponentProps} props Props passed to the component
 * @returns {Element} Preact Element
 */
export const VerticalMiniPane: FunctionalComponent = ({children}) => (
    <div class="vertical-pane vertical-pane-mini">{children}</div>
)