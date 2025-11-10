import React, { createContext, useContext, useReducer } from 'react';

const ProgressContext = createContext(null);
export const useProgress = () => useContext(ProgressContext);

const initial = { byHadith: {} };

function reducer(state, action) {
  switch(action.type) {
    case 'SET_PROGRESS':
      return { ...state, byHadith: { ...state.byHadith, [action.hadithId]: action.payload }};
    default:
      return state;
  }
}

export default function ProgressProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initial);
  const setProgress = (hadithId, payload) => dispatch({ type: 'SET_PROGRESS', hadithId, payload });
  return (
    <ProgressContext.Provider value={{ state, setProgress }}>
      {children}
    </ProgressContext.Provider>
  );
}
