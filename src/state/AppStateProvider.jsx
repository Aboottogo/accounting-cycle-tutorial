import React, { createContext, useContext, useReducer, useEffect, useRef } from 'react';
import { id } from '@instantdb/react';
import { db } from '../lib/db';
import { appReducer, initialState, ACTIONS } from './reducer';
import { saveState, loadState } from './storage';

const AppStateContext = createContext();

export const useAppState = () => {
  const context = useContext(AppStateContext);
  if (!context) throw new Error('useAppState must be used within AppStateProvider');
  return context;
};

const SAVE_DEBOUNCE_MS = 800;

export const AppStateProvider = ({ children }) => {
  const user = db.useUser();
  const { data, isLoading } = db.useQuery({ userProgress: {} });
  const progressIdRef = useRef(null);
  const initialLoadDoneRef = useRef(false);

  const [state, dispatch] = useReducer(appReducer, initialState);

  // Load from InstantDB once when query resolves (only when signed in)
  useEffect(() => {
    if (isLoading || !user || initialLoadDoneRef.current) return;
    const progressList = data?.userProgress ?? [];
    const row = progressList[0];
    if (row) {
      dispatch({
        type: ACTIONS.LOAD_STATE,
        payload: {
          journalEntries: row.journalEntries ?? {},
          postedEntries: row.postedEntries ?? [],
          version: row.version ?? 1,
        },
      });
      progressIdRef.current = row.id;
    }
    initialLoadDoneRef.current = true;
  }, [data, isLoading, user]);

  // Debounced save to InstantDB when state changes (only when signed in)
  useEffect(() => {
    if (!user || isLoading) return;
    const payload = {
      journalEntries: state.journalEntries,
      postedEntries: state.postedEntries,
      version: state.version ?? 1,
    };
    const timer = setTimeout(() => {
      const progressId = progressIdRef.current;
      if (progressId) {
        db.transact(db.tx.userProgress[progressId].update(payload));
      } else {
        const newId = id();
        db.transact([
          db.tx.userProgress[newId].update(payload).link({ $user: user.id }),
        ]);
        progressIdRef.current = newId;
      }
    }, SAVE_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [state, user, isLoading]);

  // Fallback: save to localStorage when signed in (optional backup) or when signed out we don't persist to Instant
  useEffect(() => {
    saveState(state);
  }, [state]);

  return (
    <AppStateContext.Provider value={{ state, dispatch }}>
      {children}
    </AppStateContext.Provider>
  );
};
