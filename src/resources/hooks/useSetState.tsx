import { useState } from "react";

export const useSetState = <T extends {}>(initialState: T) => {
  const [state, set] = useState(initialState);
  const setState = (patch: Partial<T>) => {
    Object.assign(state, patch);
    set({ ...state });
  };

  return [state, setState] as [T, (patch: Partial<T>) => void];
};
