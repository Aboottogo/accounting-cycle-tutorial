import React, { useState, useRef, useEffect } from 'react';
import { useAppState } from '../state/AppStateProvider';
import { ACTIONS } from '../state/reducer';
import { getAccountByNumber, chartOfAccounts, getAccountOptions } from '../domain/chartOfAccounts';
import { calculateAccountBalance, calculateTrialBalanceTotals, sumDebits, sumCredits, isEntryBalanced, compareToSolution, validateDebitCreditOrder } from '../domain/accountingMath';
import { scenario01, getSolution, getClosingEntrySolution } from '../domain/scenarios/scenario01';

export const WorksheetTab = ({ onTabChange }) => {
  const { state, dispatch } = useAppState();
  const { initialTransactions, adjustingScenarios, closingScenarios } = scenario01;
  const allInitialPosted = initialTransactions.every(txn => state.journalEntries[txn.id]?.posted || false);
  const allAdjustingPosted = adjustingScenarios.every(txn => state.journalEntries[txn.id]?.posted || false);
  const accountOptions = getAccountOptions();
  const [flashErrors, setFlashErrors] = useState({});
  const [highlightedAccounts, setHighlightedAccounts] = useState(new Set());
  const worksheetTableRef = useRef(null);
  
  // Separate balances for each section
  const unadjustedBalances = {};
  const adjustingBalances = {};
  const closingBalances = {};

  // Calculate balances for each type of entry
  state.postedEntries.forEach(entry => {
    let target;
    if (entry.isClosing) {
      target = closingBalances;
    } else if (entry.isAdjusting) {
      target = adjustingBalances;
    } else {
      target = unadjustedBalances;
    }
    
    entry.lines.forEach(line => {
      const accountNum = line.account;
      if (!target[accountNum]) target[accountNum] = { debits: 0, credits: 0 };
      target[accountNum].debits += line.debit;
      target[accountNum].credits += line.credit;
    });
  });

  // Calculate adjusted balances (unadjusted + adjusting)
  const adjustedBalances = {};
  const allAccountNumbers = new Set([
    ...Object.keys(unadjustedBalances),
    ...Object.keys(adjustingBalances),
    ...Object.keys(closingBalances)
  ]);

  allAccountNumbers.forEach(accountNum => {
    const unadj = unadjustedBalances[accountNum] || { debits: 0, credits: 0 };
    const adj = adjustingBalances[accountNum] || { debits: 0, credits: 0 };
    adjustedBalances[accountNum] = {
      debits: unadj.debits + adj.debits,
      credits: unadj.credits + adj.credits
    };
  });

  // Calculate post-close balances (adjusted + closing)
  const postCloseBalances = {};
  allAccountNumbers.forEach(accountNum => {
    const adj = adjustedBalances[accountNum] || { debits: 0, credits: 0 };
    const closing = closingBalances[accountNum] || { debits: 0, credits: 0 };
    postCloseBalances[accountNum] = {
      debits: adj.debits + closing.debits,
      credits: adj.credits + closing.credits
    };
  });

  // Calculate totals for each section
  const unadjustedTotals = calculateTrialBalanceTotals(unadjustedBalances);
  const adjustingTotals = calculateTrialBalanceTotals(adjustingBalances);
  const adjustedTotals = calculateTrialBalanceTotals(adjustedBalances);
  const closingTotals = calculateTrialBalanceTotals(closingBalances);
  const postCloseTotals = calculateTrialBalanceTotals(postCloseBalances);

  // Get all accounts sorted by number
  const allAccounts = Array.from(allAccountNumbers)
    .map(num => getAccountByNumber(parseInt(num)))
    .filter(Boolean)
    .sort((a, b) => a.number - b.number);

  // Helper function to format account balance for display
  const formatBalance = (balance, account) => {
    if (!balance || (balance.debits === 0 && balance.credits === 0)) return { debit: '', credit: '' };
    const isDebit = balance.debits > balance.credits;
    const amount = Math.abs(balance.debits - balance.credits);
    const roundedAmount = Math.round(amount);
    return {
      debit: isDebit ? `$${roundedAmount.toLocaleString()}` : '',
      credit: !isDebit ? `$${roundedAmount.toLocaleString()}` : ''
    };
  };

  const getTransactionStatus = (transactionId) => {
    const entry = state.journalEntries[transactionId];
    if (!entry || entry.lines.length === 0) return 'not-started';
    if (entry.posted) return 'posted';
    return 'in-progress';
  };

  const handlePost = (transactionId, isAdjusting = false, isClosing = false) => {
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
    
    // Check 4: Entry must match the solution (correct accounts and amounts) - only for adjusting entries
    if (isValid && isAdjusting && !isClosing) {
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
    
    // Get accounts affected by this entry for highlighting (before posting)
    const affectedAccounts = new Set();
    entry.lines.forEach(line => {
      if (line.account) {
        affectedAccounts.add(parseInt(line.account));
      }
    });
    
    // All validations passed, post the entry
    dispatch({ type: ACTIONS.POST_JOURNAL_ENTRY, payload: { transactionId, isAdjusting, isClosing } });
    
    // Navigate to worksheet tab and highlight affected rows
    if (onTabChange) {
      // Navigate to worksheet tab (if not already there)
      onTabChange('worksheet');
      
      // Small delay to ensure state updates and DOM is ready
      setTimeout(() => {
        // Scroll to the worksheet table
        if (worksheetTableRef.current) {
          worksheetTableRef.current.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
        }
        
        // Set highlighted accounts - use requestAnimationFrame to ensure instant appearance
        requestAnimationFrame(() => {
          setHighlightedAccounts(affectedAccounts);
          
          // Keep highlight fully visible for 4 seconds, then remove to trigger 4 second fade
          setTimeout(() => {
            setHighlightedAccounts(new Set());
          }, 4000);
        });
      }, 200);
    }
  };

  const renderTransactionEntry = (transaction, isAdjusting = false, isClosing = false, closeIndex = null) => {
    const transactionId = transaction.id;
    const entry = state.journalEntries[transactionId] || { date: transaction.date, lines: [], posted: false };
    const status = getTransactionStatus(transactionId);
    const debits = sumDebits(entry.lines);
    const credits = sumCredits(entry.lines);
    const balanced = isEntryBalanced(entry.lines);
    const solution = isClosing && closeIndex !== null
      ? getClosingEntrySolution(closeIndex, state.postedEntries)
      : !isClosing
      ? getSolution(transactionId)
      : null;
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
                    onClick={() => handlePost(transactionId, isAdjusting, isClosing)} 
                    className={`post-btn ${flashErrors[transactionId] ? 'flash-error' : ''}`}
                  >
                    {flashErrors[transactionId] ? 'Incorrect' : 'Post to Worksheet'}
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

  const hasPostings = state.postedEntries.length > 0;

  return (
    <div className="tab-content">
      <h2>Worksheet</h2>
      <p className="section-description">
        The worksheet summarizes account balances at different stages of the accounting cycle.
        In accounting, debits must always equal credits in each trial balance section.
      </p>

      {!hasPostings && (
        <div className="empty-state">
          <p>Post journal entries in the General Journal tab to see trial balances here.</p>
        </div>
      )}

      {hasPostings && (
        <div className="worksheet-container" ref={worksheetTableRef}>
          <div className="worksheet-table-wrapper">
            <table className="worksheet-table">
                  <thead>
                    <tr>
                  <th className="account-number-col"></th>
                  <th className="account-col"></th>
                  <th colSpan="2" className="section-header section-header-unadjusted">Unadjusted Trial Balance</th>
                  <th colSpan="2" className="section-header section-header-adjusting">Adjusting Entries</th>
                  <th colSpan="2" className="section-header section-header-adjusted">Adjusted Trial Balance</th>
                  <th colSpan="2" className="section-header section-header-closing">Closing Entries</th>
                  <th colSpan="2" className="section-header section-header-postclose">Post-Close Trial Balance</th>
                </tr>
                <tr>
                  <th className="account-number-col">Account #</th>
                  <th className="account-col">Account Name</th>
                  <th className="amount-col section-unadjusted section-header-label">Debit</th>
                  <th className="amount-col section-unadjusted section-header-label">Credit</th>
                  <th className="amount-col section-adjusting section-header-label">Debit</th>
                  <th className="amount-col section-adjusting section-header-label">Credit</th>
                  <th className="amount-col section-adjusted section-header-label">Debit</th>
                  <th className="amount-col section-adjusted section-header-label">Credit</th>
                  <th className="amount-col section-closing section-header-label">Debit</th>
                  <th className="amount-col section-closing section-header-label">Credit</th>
                  <th className="amount-col section-postclose section-header-label">Debit</th>
                  <th className="amount-col section-postclose section-header-label">Credit</th>
                    </tr>
                  </thead>
                  <tbody>
                {allAccounts.map(account => {
                  const unadjBal = formatBalance(unadjustedBalances[account.number], account);
                  const adjBal = formatBalance(adjustingBalances[account.number], account);
                  const adjustedBal = formatBalance(adjustedBalances[account.number], account);
                  const closingBal = formatBalance(closingBalances[account.number], account);
                  const postCloseBal = formatBalance(postCloseBalances[account.number], account);

                      const isHighlighted = highlightedAccounts.has(account.number);
                      return (
                    <tr key={account.number} className={isHighlighted ? 'highlight-row' : ''}>
                      <td className="account-number-col">{account.number}</td>
                      <td className="account-col">{account.name}</td>
                      <td className="amount-col section-unadjusted">{unadjBal.debit}</td>
                      <td className="amount-col section-unadjusted">{unadjBal.credit}</td>
                      <td className="amount-col section-adjusting">{adjBal.debit}</td>
                      <td className="amount-col section-adjusting">{adjBal.credit}</td>
                      <td className="amount-col section-adjusted">{adjustedBal.debit}</td>
                      <td className="amount-col section-adjusted">{adjustedBal.credit}</td>
                      <td className="amount-col section-closing">{closingBal.debit}</td>
                      <td className="amount-col section-closing">{closingBal.credit}</td>
                      <td className="amount-col section-postclose">{postCloseBal.debit}</td>
                      <td className="amount-col section-postclose">{postCloseBal.credit}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="totals-row">
                  <td className="account-number-col"></td>
                  <td className="account-col">Totals</td>
                  <td className="amount-col section-unadjusted">${Math.round(unadjustedTotals.totalDebits).toLocaleString()}</td>
                  <td className="amount-col section-unadjusted">${Math.round(unadjustedTotals.totalCredits).toLocaleString()}</td>
                  <td className="amount-col section-adjusting">${Math.round(adjustingTotals.totalDebits).toLocaleString()}</td>
                  <td className="amount-col section-adjusting">${Math.round(adjustingTotals.totalCredits).toLocaleString()}</td>
                  <td className="amount-col section-adjusted">${Math.round(adjustedTotals.totalDebits).toLocaleString()}</td>
                  <td className="amount-col section-adjusted">${Math.round(adjustedTotals.totalCredits).toLocaleString()}</td>
                  <td className="amount-col section-closing">${Math.round(closingTotals.totalDebits).toLocaleString()}</td>
                  <td className="amount-col section-closing">${Math.round(closingTotals.totalCredits).toLocaleString()}</td>
                  <td className="amount-col section-postclose">${Math.round(postCloseTotals.totalDebits).toLocaleString()}</td>
                  <td className="amount-col section-postclose">${Math.round(postCloseTotals.totalCredits).toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
        </div>
      )}

      {allInitialPosted && (
        <section className="journal-section adjusting-section">
          <h3>Adjusting Entries</h3>
          <p className="unlock-notice">All initial transactions posted. Adjusting entries are now available.</p>
          {adjustingScenarios.map(txn => renderTransactionEntry(txn, true, false))}
        </section>
      )}

      {!allInitialPosted && (
        <div className="locked-section">
          <p>Complete and post all initial transactions in the General Journal tab to unlock adjusting entries.</p>
        </div>
      )}

      {allAdjustingPosted && (
        <section className="journal-section closing-section">
          <h3>Closing Entries</h3>
          <p className="unlock-notice">All adjusting entries posted. Closing entries are now available.</p>
          <p className="section-description">
            Create closing entries to close revenue and expense accounts. Typical closing entries:
            (1) Close revenue accounts to Income Summary, (2) Close expense accounts to Income Summary,
            (3) Close Income Summary to Retained Earnings, (4) Close Dividends to Retained Earnings (if applicable).
          </p>
          {closingScenarios.map((txn, index) => renderTransactionEntry(txn, false, true, index))}
        </section>
      )}

      {allInitialPosted && !allAdjustingPosted && (
        <div className="locked-section">
          <p>Complete and post all adjusting entries to unlock closing entries.</p>
        </div>
      )}
    </div>
  );
};
