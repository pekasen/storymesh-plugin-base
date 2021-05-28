import { MenuTemplate } from "preact-sidebar";
// TODO: is this depreacated and can be removed?
export interface IMenuItemRenderer {
    render(item: MenuTemplate): preact.JSX.Element;
}
