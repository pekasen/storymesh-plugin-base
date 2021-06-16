import { Container } from "./Container";
import { exportClass } from "storygraph";
import { StoryPlugIn } from "../../../storygraph/dist/StoryGraph/registry/PlugIn";

export class Story extends Container {
    role = "internal.content.story";
    name = "My Story";
    
    constructor() {
        super();
    }
}

export const plugInExport = exportClass(Story, "Story", "internal.content.story", "", false);

export const StoryContanierPlugIn: StoryPlugIn = {
    name: "Story",
    id: "internal.content.spacer",
    public: true,
    icon: Story.defaultIcon,

    // package: {},
    constructor: Story
}
