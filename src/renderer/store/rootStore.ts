import { List } from './List';
import { IStoreableObject } from './StoreableObject';
import { UIStore } from './UIStore';

export interface IRootStoreProperties {
    model: List
    uistate: UIStore
}

export class RootStore implements IStoreableObject<IRootStoreProperties> {
    model: List
    uistate: UIStore

    constructor(list?: List, uistate?: UIStore) {
        this.model = list || new List();
        this.uistate = uistate || new UIStore();
    }

    loadFromPersistance(from: IRootStoreProperties): void {
        this.model.loadFromPersistance(from.model);
        this.uistate.loadFromPersistance(from.uistate);
    }

    reset(): void {
        this.model = new List();
        this.uistate = new UIStore();
    }
}