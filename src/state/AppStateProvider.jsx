import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { appReducer, initialState, ACTIONS } from './reducer';
import { saveState, loadState } from './storage';

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};

export const AppStateProvider = ({ children }) => {
  const [state, dispatch] = useReducer(appReducer, initialState, (initial) => {
    const saved = loadState();
    return saved || initial;
  });

  useEffect(() => {
    saveState(state);
  }, [state]);

  useEffect(() => {
    const saved = loadState();
    if (saved) dispatch({ type: ACTIONS.LOAD_STATE, payload: saved });
  }, []);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};
