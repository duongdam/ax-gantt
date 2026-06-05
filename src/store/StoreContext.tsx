import { createContext, useContext, type ReactElement, type ReactNode } from "react";

import { DatasourceStore } from "./DatasourceStore";
import { DimensionStore } from "./DimensionStore";
import { GanttStore } from "./GanttStore";

export interface RootStore {
    datasource: DatasourceStore;
    gantt: GanttStore;
    dimension: DimensionStore;
}

export function createRootStore(): RootStore {
    return {
        datasource: new DatasourceStore(),
        gantt: new GanttStore(),
        dimension: new DimensionStore()
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

export function useDatasourceStore(): DatasourceStore {
    return useRootStore().datasource;
}

export function useGanttStore(): GanttStore {
    return useRootStore().gantt;
}

export function useDimensionStore(): DimensionStore {
    return useRootStore().dimension;
}
