import { PlugInPack } from "storygraph";
import { Container, ContainerPlugIn } from "./content/Container";
import { HotSpot, HotSpotPlugIn } from "./modifiers/HotSpot";

const PlugInExports: PlugInPack = {
    name: "storymesh base",
    version: "1.0.0",
    publisher: {
        id: "storymesh",
        mail: "hello@storymesh.de",
        name: "StoryMesh"
    },
    baseURL: "https://www.storymesh.de/cdn/",
    __index: [
        ContainerPlugIn,
        HotSpotPlugIn
    ]
}

export {
    PlugInExports,
    ContainerPlugIn,
    HotSpot,
    Container
}
