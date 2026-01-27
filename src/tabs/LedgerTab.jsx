import React from 'react';
import { useAppState } from '../state/AppStateProvider';
import { ACCOUNT_CATEGORIES, getAccountsByCategory, getAccountByNumber } from '../domain/chartOfAccounts';
import { calculateAccountBalance } from '../domain/accountingMath';

export const LedgerTab = () => {
  const { state } = useAppState();
  const accountBalances = {};

  state.postedEntries.forEach(entry => {
    entry.lines.forEach(line => {
      const accountNum = line.account;
      if (!accountBalances[accountNum]) accountBalances[accountNum] = { debits: 0, credits: 0 };
      accountBalances[accountNum].debits += line.debit;
      accountBalances[accountNum].credits += line.credit;
    });
  });

  const formatCurrency = (amount) => {
    return Math.round(amount).toLocaleString('en-US', { 
      minimumFractionDigits: 0, 
      maximumFractionDigits: 0 
    });
  };

  const renderTAccount = (account) => {
    const balance = accountBalances[account.number] || { debits: 0, credits: 0 };
    const accountBalance = calculateAccountBalance(account.normalBalance, balance.debits, balance.credits);
    const postings = [];

    state.postedEntries.forEach(entry => {
      entry.lines.forEach(line => {
        if (line.account === account.number) {
          postings.push({ ...line, date: entry.date, transactionId: entry.transactionId, isAdjusting: entry.isAdjusting, isClosing: entry.isClosing });
        }
      });
    });

    if (postings.length === 0) return null;

    return (
      <div key={account.number} className="t-account">
        <div className="t-account-header">
          <div className="account-number">{account.number}</div>
          <div className="account-name">{account.name}</div>
        </div>
        <div className="t-account-body">
          <div className="t-account-debit">
            <div className="t-account-column-header">Debit</div>
            {postings.filter(p => p.debit > 0).map((posting, idx) => (
              <div key={idx} className={`t-account-entry ${posting.isAdjusting ? 'adjusting' : ''} ${posting.isClosing ? 'closing' : ''}`}>
                <span className="entry-reference">({posting.transactionId})</span>
                <span className="entry-amount">${formatCurrency(posting.debit)}</span>
              </div>
            ))}
            {account.normalBalance === 'debit' && (
              <div className="t-account-balance">Balance: ${formatCurrency(accountBalance)}</div>
            )}
          </div>
          <div className="t-account-credit">
            <div className="t-account-column-header">Credit</div>
            {postings.filter(p => p.credit > 0).map((posting, idx) => (
              <div key={idx} className={`t-account-entry ${posting.isAdjusting ? 'adjusting' : ''} ${posting.isClosing ? 'closing' : ''}`}>
                <span className="entry-amount">${formatCurrency(posting.credit)}</span>
                <span className="entry-reference">({posting.transactionId})</span>
              </div>
            ))}
            {account.normalBalance === 'credit' && (
              <div className="t-account-balance">Balance: ${formatCurrency(accountBalance)}</div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderCategorySection = (category, categoryLabel) => {
    const accounts = getAccountsByCategory(category);
    const accountsWithActivity = accounts.filter(acc => accountBalances[acc.number] && (accountBalances[acc.number].debits > 0 || accountBalances[acc.number].credits > 0));
    if (accountsWithActivity.length === 0) return null;

    return (
      <section key={category} className="ledger-category">
        <h3>{categoryLabel}</h3>
        <div className="t-accounts-grid">
          {accountsWithActivity.map(account => renderTAccount(account))}
        </div>
      </section>
    );
  };

  const hasPostings = state.postedEntries.length > 0;

  return (
    <div className="tab-content">
      <h2>General Ledger</h2>
      <p className="section-description">
        T-accounts showing all posted journal entries. Accounts are grouped by category.
        Running balances are calculated based on each account's normal balance.
      </p>

      {!hasPostings && (
        <div className="empty-state">
          <p>No entries posted yet. Post journal entries in the General Journal tab to see them here.</p>
        </div>
      )}

      {hasPostings && (
        <>
          {renderCategorySection(ACCOUNT_CATEGORIES.ASSETS, 'Assets')}
          {renderCategorySection(ACCOUNT_CATEGORIES.LIABILITIES, 'Liabilities')}
          {renderCategorySection(ACCOUNT_CATEGORIES.EQUITY, 'Equity')}
          {renderCategorySection(ACCOUNT_CATEGORIES.REVENUE, 'Revenue')}
          {renderCategorySection(ACCOUNT_CATEGORIES.EXPENSES, 'Expenses')}
          <div className="ledger-completion-message">
            <span className="green-checkmark">✓</span> Review account balances on the Worksheet tab.
          </div>
        </>
      )}
    </div>
  );
};
