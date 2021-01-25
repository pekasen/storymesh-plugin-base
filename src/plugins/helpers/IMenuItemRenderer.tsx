import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";

export interface IMenuItemRenderer {
    render(item: IMenuTemplate): preact.JSX.Element;
}
