import { action, makeObservable, observable } from 'mobx';
import { v4 } from 'uuid';

export type NotificationType = "warn" | "error" | "normal";

export class Notification {
    id: string
    message: string
    type: NotificationType
    origin: unknown

    constructor(message: string, origin: unknown, type?: NotificationType) {
        this.id = v4();
        this.message = message;
        this.origin = origin;
        this.type = type || "normal";
    }
}

export class NotificationStore {
    buffer: Notification[];

    constructor() {
        this.buffer = [];

        makeObservable(this,{
            buffer: observable,
            postNotification: action,
            destroyNotification: action
        });
    }

    postNotification(message: string, origin: unknown, type?: NotificationType, autodestruct?: number): void {
        const _n = new Notification(message, origin, type);
        this.buffer.push(_n);
        if (autodestruct && typeof autodestruct === "number") {
            setTimeout(() => {
                this.destroyNotification(_n.id);
            }, autodestruct * 1000);
        }
    }

    destroyNotification(id: string): void {
        this.buffer.splice(
            this.buffer.findIndex(e => e.id === id), 1
        );
    }
}