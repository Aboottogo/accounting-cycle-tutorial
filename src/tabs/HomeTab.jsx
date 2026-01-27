import React from 'react';
import { scenario01 } from '../domain/scenarios/scenario01';

export const HomeTab = () => {
  const { company, initialTransactions, adjustingScenarios } = scenario01;

  return (
    <div className="tab-content">
      <section className="introduction-section">
        <h2>Welcome to the Accounting Cycle Learning App</h2>

        <div className="project-goals">
          <h3>Project Goals</h3>
          <p>
            This tool is designed to help you learn the accounting cycle through hands-on practice. 
            You will work through a complete accounting cycle using a realistic business scenario, recording transactions, 
            posting to accounts, preparing financial statements, and completing all the steps that professional accountants 
            perform in their daily work. This project helps you go through the 9 steps of the accounting cycle with a hands-on example. 
            By completing this exercise, you will gain practical experience with each phase of the accounting process.
          </p>
          <div className="accounting-cycle-image">
            <img 
              src="/accounting-cycle-flowchart.png" 
              alt="Accounting Cycle Flowchart showing the 9 steps of the accounting cycle"
              className="flowchart-image"
            />
          </div>
        </div>

        <div className="instructions-section">
          <h3>How to Complete This Project</h3>
          <p>
            Use the tabs above to work through each step of the accounting cycle. Follow this sequence:
          </p>
          <ol className="instructions-list">
            <li><strong>Home Tab (this page):</strong> Review the company information and transactions listed below.</li>
            <li><strong>General Journal Tab:</strong> Record journal entries for each transaction. Make sure debits equal credits for each entry.</li>
            <li><strong>General Ledger Tab:</strong> View the T-accounts that are automatically updated as you post journal entries.</li>
            <li><strong>Worksheet Tab:</strong> Review the trial balance and see how adjusting entries affect account balances.</li>
            <li><strong>Financial Statements Tab:</strong> View the Income Statement and Balance Sheet generated from your work.</li>
          </ol>
          <p>
            After completing all initial transactions, you will work through adjusting entries, then prepare the final 
            financial statements. Use the "Show Solution" buttons if you need help with any journal entry. 
            Only correct journal entries will post successfully to the ledger. If you attempt to post an incorrect entry, 
            the "Post to Ledger" button will flash red and display "Incorrect" to alert you that the entry needs to be fixed.
          </p>
        </div>
      </section>

      <div className="company-context">
        <h2>{company.name}</h2>
        <p className="company-industry">{company.industry}</p>
        <p className="company-description">{company.description}</p>

        <section className="transactions-section">
          <h3>Initial Transactions</h3>
          <p className="section-description">
            Review these transactions. You will record journal entries for each in the General Journal tab.
          </p>
          <ul className="instructions-list no-numbers">
            {initialTransactions.map(txn => (
              <li key={txn.id}><strong>{txn.id}:</strong> {txn.summary}</li>
            ))}
          </ul>
        </section>

        <section className="transactions-section">
          <h3>Adjusting Entries</h3>
          <p className="section-description">
            These adjusting entries will become available after you post all initial transactions.
          </p>
          <ul className="instructions-list no-numbers">
            {adjustingScenarios.map(txn => (
              <li key={txn.id}><strong>{txn.id}:</strong> {txn.summary}</li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
};
