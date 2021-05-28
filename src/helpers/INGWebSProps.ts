import { IRenderingProperties, IStoryModifier, StoryGraph } from "storygraph";
import { IContent } from "storygraph/dist/StoryGraph/IContent";
import { VReg } from "storymesh-plugin-support";

export interface INGWebSProps {
    id: string
    registry: VReg
    renderingProperties?: IRenderingProperties
    userDefinedProperties?: any;
    content?: IContent
    modifiers?: IStoryModifier[]
    graph?: StoryGraph
}
