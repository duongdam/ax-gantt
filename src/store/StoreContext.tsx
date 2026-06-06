import { configure } from "mobx";
import { createContext, useContext, type ReactElement, type ReactNode } from "react";

import { GanttStore } from "./GanttStore";
import { JsonDataStore } from "./JsonDataStore";

configure({ isolateGlobalState: true });

export interface RootStore {
    jsonData: JsonDataStore;
    gantt: GanttStore;
}

export function createRootStore(): RootStore {
    return {
        jsonData: new JsonDataStore(),
        gantt: new GanttStore()
    };
}

const StoreContext = createContext<RootStore | null>(null);

export interface StoreProviderProps {
    store: RootStore;
    children: ReactNode;
}

export function StoreProvider({ store, children }: StoreProviderProps): ReactElement {
    return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useRootStore(): RootStore {
    const store = useContext(StoreContext);
    if (!store) {
        throw new Error("useRootStore must be used within StoreProvider");
    }
    return store;
}

export function useJsonDataStore(): JsonDataStore {
    return useRootStore().jsonData;
}

export function useGanttStore(): GanttStore {
    return useRootStore().gantt;
}
