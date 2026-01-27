import React from 'react';
import { useAppState } from '../state/AppStateProvider';

export const ProgressBar = ({ totalInitial, totalAdjusting, totalClosing }) => {
  const { state } = useAppState();
  const postedInitial = state.postedEntries.filter(e => !e.isAdjusting && !e.isClosing).length;
  const postedAdjusting = state.postedEntries.filter(e => e.isAdjusting && !e.isClosing).length;
  const postedClosing = state.postedEntries.filter(e => e.isClosing).length;
  const totalTransactions = totalInitial + totalAdjusting + (totalClosing || 0);
  const totalPosted = postedInitial + postedAdjusting + postedClosing;
  const percentage = totalTransactions > 0 ? Math.round((totalPosted / totalTransactions) * 100) : 0;

  return (
    <div className="progress-bar-container">
      <div className="progress-label">Progress: {totalPosted} / {totalTransactions} transactions posted ({percentage}%)</div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${percentage}%` }} aria-label={`${percentage}% complete`} />
      </div>
    </div>
  );
};
