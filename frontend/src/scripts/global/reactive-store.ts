export const createReactiveStore = <T extends object>(initialState: T) => {
    let state = initialState;
    const subscribers: Set<(newState: T) => void> = new Set();

    // A helper function to notify all subscribers when the state changes
    const notifySubscribers = () => {
        for (const subscriber of subscribers) {
            subscriber(state);
        }
    };

    // The reactive store, wrapped in a Proxy to observe state changes
    const reactiveState = new Proxy(state, {
        set: (target, p: string | symbol, value: any, receiver: any) => {
            target[p as keyof T] = value;
            notifySubscribers();
            return true;
        },
    });

    // Function to subscribe to state changes
    const subscribe = (subscriber: (newState: T) => void) => {
        subscribers.add(subscriber);
    };

    // Function to unsubscribe from state changes
    const unsubscribe = (subscriber: (newState: T) => void) => {
        subscribers.delete(subscriber);
    };

    // Function to get the current state
    const getState = () => state;

    // Return the reactive state object along with utility methods
    return {
        reactiveState,
        subscribe,
        unsubscribe,
        getState,
    };
};
