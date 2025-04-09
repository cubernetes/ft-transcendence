/**
 * A general reactive store for global states.
 */
export const createStore = <T extends object>(initialState: T) => {
    let state = initialState;
    const subscribers: Set<(newState: T) => void> = new Set();

    // A helper function to notify all subscribers when the state changes
    const notifySubscribers = () => {
        for (const subscriber of subscribers) {
            subscriber(state);
        }
    };

    // The reactive store, wrapped in a Proxy to observe state changes
    // Directly field only, doesn't handle delete, set explicitly gives you more control, maybe
    // const reactiveState = new Proxy(state, {
    //     set: (target, p: string | symbol, value: any, receiver: any) => {
    //         target[p as keyof T] = value;
    //         notifySubscribers();
    //         return true;
    //     },
    // });

    // Function to subscribe to state changes
    const subscribe = (subscriber: (newState: T) => void) => {
        subscribers.add(subscriber);
    };
    // Update with partial object
    const update = (newStates: Partial<T>) => {
        // Create a new object with merged values
        state = { ...state, ...newStates };
        notifySubscribers();
    };

    const set = (newState: T) => {
        state = newState;
        notifySubscribers();
    };

    const get = () => state;

    return {
        subscribe,
        update,
        set,
        get,
    };
};
