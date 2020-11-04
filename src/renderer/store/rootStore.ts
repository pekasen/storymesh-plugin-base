import { IStoreableObject } from './StoreableObject';
import { UIStore } from './UIStore';
import StoryGraph from "storygraph";
import { ClassRegistry, ValueRegistry } from '../utils/registry';

export interface IRootStoreProperties {
    // TODO: implement real data model
    uistate: UIStore
    storyObjectRegistry: ValueRegistry<StoryGraph>
    storyComponentRegistry: ClassRegistry<StoryGraph>
}

export class RootStore implements IStoreableObject<IRootStoreProperties> {
    // model: List
    uistate: UIStore
    storyComponentRegistry: ClassRegistry<StoryGraph>
    storyObjectRegistry: ValueRegistry<StoryGraph>

    constructor(
        // list?: List,
        uistate?: UIStore
        ) {
        // this.model = list || new List();
        this.uistate = uistate || new UIStore();
        // this.story = new StoryGraph()
        this.storyComponentRegistry = new ClassRegistry<StoryGraph>()
        this.storyObjectRegistry = new ValueRegistry<StoryGraph>()
    }

    loadFromPersistance(from: IRootStoreProperties): void {
        // this.model.loadFromPersistance(from.model);
        this.uistate.loadFromPersistance(from.uistate);
    }

    writeToPersistance(): void {
        null
    }

    reset(): void {
        // this.model = new List();
        this.uistate = new UIStore();
    }
}