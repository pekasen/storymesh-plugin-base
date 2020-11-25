import { makeAutoObservable, reaction } from "mobx";
import { MoveableItem } from "./MoveableItem";
import { IStoreableObject } from './StoreableObject';
import { WindowProperties } from './WindowProperties';
import { ValueRegistry } from '../utils/registry';
import { RootStore } from './rootStore';
import { EdgeItem } from "./EdgeItem";
import { SelectedItemStore } from './SelectedItemStore';


interface IUIStoreProperties {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem>
    term: string
    file: string
}

export class UIStore implements IStoreableObject<IUIStoreProperties> {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem>
    edges: EdgeItem[]
    term: string
    file: string
    hideLeftSidebar: boolean
    hideRightSidebar: boolean
    selectedItems: SelectedItemStore
    loadedItem: string
    topLevelObjectID: string
    private _parent: RootStore

    constructor(parent: RootStore) {
        this._parent = parent;
        this.loadedItem = "";
        this.edges = []
        this.selectedItems = new SelectedItemStore();
        this.topLevelObjectID = "";

        // TODO: make stuff move again!!1
        this.moveableItems = new ValueRegistry<MoveableItem>();
        this.file = "";
        // TODO: actually use the WindowProperties!
        this.windowProperties = new WindowProperties();
        
        this.term = "";
        this.hideLeftSidebar = false;
        this.hideRightSidebar = false;

        makeAutoObservable(this);

        reaction(
            () => (this.loadedItem),
            (id: string) => console.log("loaded item:", id)
        )
    }

    appendEdgeItem(edge: EdgeItem): void {
        this.edges = [...this.edges, edge];
    }

    removeEdgeItem(edge: EdgeItem): void {
        const index = this.edges.indexOf(edge);
        if (index !== -1) {
            this.edges.splice(index, 1);
        }
    }

    setLoadedItem(id: string): void {
        const obj = this._parent.storyContentObjectRegistry.getValue(id);
        if (obj) {
            this.loadedItem = obj.id;
        }
    }

    setFile(file: string): void {
        this.file = file;
    }
  
    loadFromPersistance(from: IUIStoreProperties): void {
        this.file = from.file;
        this.term = from.term;
        // this.windowProperties.loadFromPersistance(from.windowProperties);
    }

    writeToPersistance(): void {    
        // TODO: implement
        null
    }

    toggleSidebar(which: "left" | "right"): void {
        if (which === "left") this.hideLeftSidebar = !this.hideLeftSidebar
        if (which === "right") this.hideRightSidebar = !this.hideRightSidebar
    }

    get untitledDocument (): boolean {
        return this.file === "";
    }
}
