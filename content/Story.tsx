import { Container } from "./Container";
import { exportClass } from "../helpers/exportClass";

export class Story extends Container {
    role = "internal.content.story";
    name = "My Story";
    
    constructor() {
        super();
    }
}

export const plugInExport = exportClass(Story, "Story", "internal.content.story", "", false);