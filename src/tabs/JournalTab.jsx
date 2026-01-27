import React, { useState, useEffect } from 'react';
import { useAppState } from '../state/AppStateProvider';
import { ACTIONS } from '../state/reducer';
import { scenario01, getSolution } from '../domain/scenarios/scenario01';

// Note: Adjusting entries have been moved to the Worksheet tab
import { getAccountOptions, getAccountByNumber } from '../domain/chartOfAccounts';
import { sumDebits, sumCredits, isEntryBalanced, compareToSolution, validateDebitCreditOrder } from '../domain/accountingMath';

export const JournalTab = ({ onEntryPosted }) => {
  const { state, dispatch } = useAppState();
  const { initialTransactions } = scenario01;
  const accountOptions = getAccountOptions();
  const [flashErrors, setFlashErrors] = useState({});

  const getTransactionStatus = (transactionId) => {
    const entry = state.journalEntries[transactionId];
    if (!entry || entry.lines.length === 0) return 'not-started';
    if (entry.posted) return 'posted';
    return 'in-progress';
  };

  const handlePost = (transactionId, isAdjusting = false) => {
    const entry = state.journalEntries[transactionId];
    if (!entry || entry.posted) return;
    
    // Validate entry
    let isValid = true;
    let errorMessage = '';
    
    // Check 1: Entry must have at least one line
    if (entry.lines.length === 0) {
      isValid = false;
      errorMessage = 'Entry is empty';
    }
    
    // Check 2: Entry must be balanced
    if (isValid && !isEntryBalanced(entry.lines)) {
      isValid = false;
      errorMessage = 'Entry is not balanced (debits must equal credits)';
    }
    
    // Check 3: Debits must come before credits
    if (isValid && !validateDebitCreditOrder(entry.lines)) {
      isValid = false;
      errorMessage = 'Debit rows must come before credit rows';
    }
    
    // Check 4: Entry must match the solution (correct accounts and amounts)
    if (isValid) {
      const solution = getSolution(transactionId);
      if (solution && Object.keys(solution).length > 0) {
        const comparison = compareToSolution(entry.lines, solution);
        if (!comparison.isCorrect) {
          isValid = false;
          errorMessage = 'Entry does not match the correct solution';
        }
      }
    }
    
    // If validation failed, flash error
    if (!isValid) {
      setFlashErrors(prev => ({ ...prev, [transactionId]: true }));
      setTimeout(() => {
        setFlashErrors(prev => {
          const updated = { ...prev };
          delete updated[transactionId];
          return updated;
        });
      }, 1000);
      return;
    }
    
    // All validations passed, post the entry
    dispatch({ type: ACTIONS.POST_JOURNAL_ENTRY, payload: { transactionId, isAdjusting } });
    
    // Trigger flash animation on the General Ledger tab
    if (onEntryPosted) {
      onEntryPosted();
    }
  };

  const renderTransactionEntry = (transaction, isAdjusting = false) => {
    const transactionId = transaction.id;
    const entry = state.journalEntries[transactionId] || { date: transaction.date, lines: [], posted: false };
    const status = getTransactionStatus(transactionId);
    const debits = sumDebits(entry.lines);
    const credits = sumCredits(entry.lines);
    const balanced = isEntryBalanced(entry.lines);
    const canPost = balanced && entry.lines.length > 0 && !entry.posted;
    const solution = getSolution(transactionId);
    const hasSolution = solution && Object.keys(solution).length > 0;

    return (
      <div key={transactionId} className={`journal-entry-form ${status}`}>
        <div className="journal-entry-header">
          <div className="transaction-info">
            <span className="transaction-id">{transactionId}:</span> <span className="transaction-description">{transaction.description}</span>
          </div>
        </div>

        <div className="journal-entry-grid">
          <div className="journal-grid-header">
            <div>Date</div>
            <div>Account</div>
            <div className="amount-col">Debit</div>
            <div className="amount-col">Credit</div>
            <div></div>
          </div>

          {entry.lines.map((line, idx) => (
            <div key={line.id || idx} className="journal-grid-row">
              {idx === 0 ? (
                <input
                  type="date"
                  value={entry.date || transaction.date}
                  onChange={(e) => dispatch({ type: ACTIONS.UPDATE_JOURNAL_LINE, payload: { transactionId, lineId: 'entry-date', field: 'date', value: e.target.value } })}
                  disabled={entry.posted}
                  className="journal-date-input"
                />
              ) : (
                <div className="journal-date-empty"></div>
              )}
              <select
                value={line.account}
                onChange={(e) => dispatch({ type: ACTIONS.UPDATE_JOURNAL_LINE, payload: { transactionId, lineId: line.id, field: 'account', value: e.target.value } })}
                disabled={entry.posted}
              >
                <option value="">Select Account</option>
                {accountOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
              <input
                type="number"
                step="1"
                value={line.debit || ''}
                onChange={(e) => dispatch({ type: ACTIONS.UPDATE_JOURNAL_LINE, payload: { transactionId, lineId: line.id, field: 'debit', value: e.target.value } })}
                disabled={entry.posted || line.credit}
                placeholder="0"
                className="amount-input"
              />
              <input
                type="number"
                step="1"
                value={line.credit || ''}
                onChange={(e) => dispatch({ type: ACTIONS.UPDATE_JOURNAL_LINE, payload: { transactionId, lineId: line.id, field: 'credit', value: e.target.value } })}
                disabled={entry.posted || line.debit}
                placeholder="0"
                className="amount-input"
              />
              {!entry.posted && (
                <button
                  onClick={() => dispatch({ type: ACTIONS.REMOVE_JOURNAL_LINE, payload: { transactionId, lineId: line.id } })}
                  className="remove-line-btn"
                  aria-label="Delete Row"
                  title="Delete Row"
                >
                  ×
                </button>
              )}
            </div>
          ))}

          {!entry.posted && (
            <button
              onClick={() => dispatch({ type: ACTIONS.ADD_JOURNAL_LINE, payload: { transactionId } })}
              className="add-line-btn"
            >
              + Add Line
            </button>
          )}

          <div className="journal-totals">
            <div></div>
            <div>Totals:</div>
            <div className={`amount-col ${balanced ? '' : 'unbalanced'}`}>${Math.round(debits).toLocaleString()}</div>
            <div className={`amount-col ${balanced ? '' : 'unbalanced'}`}>${Math.round(credits).toLocaleString()}</div>
            <div>
              {balanced && entry.lines.length > 0 ? (
                <span className="balanced-indicator">✓ Balanced</span>
              ) : entry.lines.length > 0 ? (
                <span className="unbalanced-indicator">Unbalanced</span>
              ) : null}
            </div>
          </div>

          {!entry.posted && (
            <div className="journal-grid-row solution-row">
              <div>
                {entry.lines.length > 0 && (
                  <button 
                    onClick={() => handlePost(transactionId, isAdjusting)} 
                    className={`post-btn ${flashErrors[transactionId] ? 'flash-error' : ''}`}
                  >
                    {flashErrors[transactionId] ? 'Incorrect' : 'Post to Ledger'}
                  </button>
                )}
              </div>
              <div></div>
              <div></div>
              <div></div>
              <div>
                {hasSolution && (
                  <button
                    onClick={() => {
                      dispatch({
                        type: ACTIONS.LOAD_SOLUTION,
                        payload: {
                          transactionId,
                          solution,
                          date: transaction.date
                        }
                      });
                    }}
                    className="show-solution-btn"
                  >
                    Show Solution
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Check if all initial transactions are posted
  const allEntriesPosted = initialTransactions.every(txn => {
    const entry = state.journalEntries[txn.id];
    return entry && entry.posted;
  });

  return (
    <div className="tab-content">
      <h2>General Journal</h2>
      <p className="section-description">
        Record journal entries for each transaction. Each entry must have equal debits and credits.
        Click "Post to Ledger" when an entry is complete and balanced.
      </p>

      <section className="journal-section">
        <h3>Initial Transactions</h3>
        {initialTransactions.map(txn => renderTransactionEntry(txn, false))}
        {allEntriesPosted && (
          <div className="journal-completion-message">
            <span className="green-checkmark">✓</span> Review all transactions on the General Ledger tab.
          </div>
        )}
      </section>
    </div>
  );
};
