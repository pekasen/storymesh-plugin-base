import { makeAutoObservable } from "mobx";
import { MoveableItem } from "./MoveableItem";
import { IStoreableObject } from './StoreableObject';
import { WindowProperties } from './WindowProperties';
import { ValueRegistry } from '../utils/registry';
import { IStoryObject } from 'storygraph/dist/StoryGraph/IStoryObject';

interface IUIStoreProperties {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem<IStoryObject>>
    term: string
    file: string
}

export class UIStore implements IStoreableObject<IUIStoreProperties> {
    windowProperties: WindowProperties
    moveableItems: ValueRegistry<MoveableItem<IStoryObject>>
    term: string
    file: string
    leftSidebar: boolean
    activeitem: string;

    constructor() {
        this.moveableItems = new ValueRegistry<MoveableItem<IStoryObject>>();
        this.term = "";
        this.file = "";
        this.leftSidebar = false;
        this.windowProperties = new WindowProperties();
        this.activeitem = "";
        makeAutoObservable(this);
    }

    setFile(file: string): void {
        this.file = file;
    }

  
    loadFromPersistance(from: IUIStoreProperties): void {
        this.file = from.file;
        this.term = from.term;
        this.windowProperties.loadFromPersistance(from.windowProperties);
        // this.moveableItems = from.moveableItems
        // .map(e => {
        //     const data = rootStore.model.itemByID(e.data.id);
        //     if (data !== undefined) return new MoveableItem(data, e.x, e.y)
        // })
        // .filter(e => e !== undefined) as MoveableItem[];
    }

    // TODO: implement
    writeToPersistance(): void {
        null
    }

    toggleSidebar(): void {
        this.leftSidebar = !this.leftSidebar;
    }

    setActiveItem(id: string): void {
        this.activeitem = id;
    }

    get untitledDocument (): boolean {
        return this.file === "";
    }
}
