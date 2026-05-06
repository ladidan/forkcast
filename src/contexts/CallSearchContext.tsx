import { createContext, useCallback, useContext, useState, ReactNode } from 'react';

type CallSearchOpen = () => void;

interface CallSearchContextValue {
  /** Set by the active call detail page; null when no call is open. */
  openSearch: CallSearchOpen | null;
  setOpenSearch: (handler: CallSearchOpen | null) => void;
}

const CallSearchContext = createContext<CallSearchContextValue>({
  openSearch: null,
  setOpenSearch: () => {},
});

export function CallSearchProvider({ children }: { children: ReactNode }) {
  // Wrap the function in an object to avoid the useState-with-function-value pitfall
  // (where the setter would interpret a bare function as an updater).
  const [state, setState] = useState<{ open: CallSearchOpen | null }>({ open: null });
  const setOpenSearch = useCallback((handler: CallSearchOpen | null) => {
    setState({ open: handler });
  }, []);
  return (
    <CallSearchContext.Provider value={{ openSearch: state.open, setOpenSearch }}>
      {children}
    </CallSearchContext.Provider>
  );
}

export function useCallSearch() {
  return useContext(CallSearchContext);
}
