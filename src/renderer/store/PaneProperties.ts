import { makeAutoObservable } from 'mobx';
import { createModelSchema, primitive, setDefaultModelSchema } from 'serializr';

export class PaneProperties implements IPaneProperties {

    width: number;
    hidden: boolean;

    constructor(width?: number, hidden?: boolean) {
        this.width = width || 150;
        this.hidden = hidden || false;
        makeAutoObservable(this);
    }

    setWidth(width: number): void {
        this.width = width;
    }

    toggleHidden(): void {
        this.hidden = !this.hidden;
    }
}

export interface IPaneProperties {
    width: number;
    hidden: boolean;
}

export const PanePropertiesSchema = createModelSchema(PaneProperties, {
    width: primitive(),
    hidden: primitive()
});

setDefaultModelSchema(PaneProperties, PanePropertiesSchema);