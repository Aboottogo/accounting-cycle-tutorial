const STORAGE_KEY = 'accounting-cycle-app-state';
const CURRENT_VERSION = 1;

export const saveState = (state) => {
  try {
    const stateToSave = { ...state, version: CURRENT_VERSION, lastSaved: new Date().toISOString() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
  } catch (error) {
    console.error('Failed to save state to localStorage:', error);
  }
};

export const loadState = () => {
  try {
    const serialized = localStorage.getItem(STORAGE_KEY);
    if (!serialized) return null;
    const state = JSON.parse(serialized);
    if (state.version !== CURRENT_VERSION) {
      console.warn(`State version mismatch. Current: ${CURRENT_VERSION}, Found: ${state.version}`);
      return null;
    }
    return state;
  } catch (error) {
    console.error('Failed to load state from localStorage:', error);
    return null;
  }
};

export const clearState = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear state from localStorage:', error);
  }
};
