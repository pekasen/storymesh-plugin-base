import { action, makeObservable, observable } from "mobx";
import { IStoryModifier, ModifierType } from "storygraph";
import { IMenuTemplate } from "../../renderer/utils/PlugInClassRegistry";

function isStoryModifierType(type: string): boolean {
    const modifierTypes = ["css-class", "css-inline", "css-hybrid"];
    return modifierTypes.indexOf(type) !== -1;
}

export abstract class AbstractStoryModifier implements IStoryModifier {
    abstract name: string;
    abstract type: ModifierType;
    abstract get getMenuTemplate(): IMenuTemplate[];
    abstract get getRenderingProperties(): any;
}

export class ObservableStoryModifier extends AbstractStoryModifier {
    public name: string;
    public type: ModifierType;
    
    public get getMenuTemplate(): IMenuTemplate[] {
        return [
            {
                label: "Name",
                type: "text",
                value: () => this.name,
                valueReference: (name: string) => this.updateName(name)
            },
            {
                label: "Type",
                type: "dropdown",
                value: () => this.type,
                valueReference: (type: ModifierType) => this.updateType(type),
                options: ["css-class", "css-inline", "css-hybrid"]
            }
        ]
        // throw new Error("Method not implemented.");
    }

    public get getRenderingProperties(): any | undefined {
        throw("");
    }

    public updateName(name: string): void {
        this.name = name;
    }

    public updateType(type: ModifierType): void {
        if (isStoryModifierType(type)) {
            this.type = type;
        }
    }

    public deleteMe(): void {
        throw("");
    }

    public constructor() {
        super();

        this.name = "";
        this.type = "css-inline";

        makeObservable(this, {
            name: observable,
            type: observable,
            updateName: action,
            updateType: action
        })
    }
}

export class CSSGridModifier extends ObservableStoryModifier {
    public type: ModifierType = "css-class";

    public get getMenuTemplate(): IMenuTemplate[] {
        return super.getMenuTemplate;
    }

    public get getRenderingProperties(): any {
        return super.getRenderingProperties;
    }
}
