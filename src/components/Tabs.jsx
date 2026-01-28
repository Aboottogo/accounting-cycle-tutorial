import React from 'react';

const TABS = [
  { id: 'home', label: 'Home' },
  { id: 'journal', label: 'General Journal' },
  { id: 'ledger', label: 'General Ledger' },
  { id: 'worksheet', label: 'Worksheet' },
  { id: 'statements', label: 'Financial Statements' }
];

export const Tabs = ({ activeTab, onTabChange, flashLedgerTab, flashWorksheetTab, flashStatementsTab }) => {
  const getFlashClass = (tabId) => {
    if (tabId === 'ledger' && flashLedgerTab) return 'flash-blue';
    if (tabId === 'worksheet' && flashWorksheetTab) return 'flash-blue';
    if (tabId === 'statements' && flashStatementsTab) return 'flash-blue';
    return '';
  };

  return (
    <div className="tabs-container">
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'active' : ''} ${getFlashClass(tab.id)}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};
