/** A general reactive store for global states. */
export const createStore = <T extends object>(initialState: T) => {
    let state: T = initialState;

    const subscribers: Set<(newState: T) => void> = new Set();

    const notifySubscribers = () => {
        for (const subscriber of subscribers) {
            subscriber(state);
        }
    };

    /**
     * Function to subscrite to state changes.
     * Doesn't care whether subscriber is sync or async.
     * @param subscriber the callback function when state change is triggered
     * @returns the function to unsubscribe
     * @example const unsubscribe = authStore.subscribte((state) => whatever());
     *          later, call unsubscribe();
     */
    const subscribe = (subscriber: (newState: T) => void) => {
        subscribers.add(subscriber);
        return () => subscribers.delete(subscriber);
    };

    /** Function to update partial state. */
    const update = (newStates: Partial<T>) => {
        state = { ...state, ...newStates };
        notifySubscribers();
    };

    const set = (newState: T) => {
        state = newState;
        notifySubscribers();
    };

    const get = () => state;

    return { subscribe, update, set, get };
};
