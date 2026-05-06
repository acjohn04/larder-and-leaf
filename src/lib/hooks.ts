import { useSyncExternalStore } from 'react'

/**
 * A hook that returns true if the component is mounted on the client,
 * and false during SSR and initial hydration.
 * 
 * This uses useSyncExternalStore to avoid the "setState in useEffect" 
 * lint error and handle hydration mismatches declaratively.
 */
export function useIsClient() {
    return useSyncExternalStore(
        () => () => {}, // empty subscribe
        () => true,     // getSnapshot (client)
        () => false     // getServerSnapshot (server/hydration)
    )
}
