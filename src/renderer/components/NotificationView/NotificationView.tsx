import { reaction } from 'mobx';
import { h } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { Store } from '../..';

export const NotificationView = () => {
    const { notifications } = useContext(Store);
    const [, setState] = useState({});
    
    useEffect(() => {
        const disposer = reaction(
            () => (notifications.buffer.length),
            () => {
                setState({});
            }
        );

        return () => {
            disposer();
        }
    });

    return <div id="notification-view">
        {
            notifications.buffer.map(e => (
                <div id={e.id} class={`notification ${e.type}`} onClick={() => notifications.destroyNotification(e.id)}>
                    <p>{e.message} in</p>
                </div>
            ))
        }
    </div>
}