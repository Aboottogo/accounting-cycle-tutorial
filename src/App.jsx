import React, { useState } from 'react';
import { AppStateProvider, useAppState } from './state/AppStateProvider';
import { ACTIONS } from './state/reducer';
import { Tabs } from './components/Tabs';
import { ProgressBar } from './components/ProgressBar';
import { HomeTab } from './tabs/HomeTab';
import { JournalTab } from './tabs/JournalTab';
import { LedgerTab } from './tabs/LedgerTab';
import { WorksheetTab } from './tabs/WorksheetTab';
import { StatementsTab } from './tabs/StatementsTab';
import { scenario01 } from './domain/scenarios/scenario01';

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [flashLedgerTab, setFlashLedgerTab] = useState(false);
  const { state, dispatch } = useAppState();
  const { initialTransactions, adjustingScenarios } = scenario01;
  const totalInitial = initialTransactions.length;
  const totalAdjusting = adjustingScenarios.length;
  const totalClosing = 4; // There are always 4 closing entries: C1, C2, C3, C4

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your work? This cannot be undone.')) {
      dispatch({ type: ACTIONS.RESET_ALL });
    }
  };

  const handleEntryPosted = () => {
    setFlashLedgerTab(true);
    // Remove the flash class after animation completes
    setTimeout(() => {
      setFlashLedgerTab(false);
    }, 2000);
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'home': return <HomeTab />;
      case 'journal': return <JournalTab onEntryPosted={handleEntryPosted} />;
      case 'ledger': return <LedgerTab />;
      case 'worksheet': return <WorksheetTab onTabChange={setActiveTab} />;
      case 'statements': return <StatementsTab />;
      default: return <HomeTab />;
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>Accounting Cycle Learning App</h1>
        <div className="header-controls">
          <button onClick={handleReset} className="reset-btn">Reset All</button>
        </div>
      </header>

      <ProgressBar totalInitial={totalInitial} totalAdjusting={totalAdjusting} totalClosing={totalClosing} />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} flashLedgerTab={flashLedgerTab} />

      <main className="app-main">
        {renderTabContent()}
      </main>

      <footer className="app-footer">
        <p>Educational tool for learning the accounting cycle</p>
      </footer>
    </div>
  );
};

const App = () => {
  return (
    <AppStateProvider>
      <AppContent />
    </AppStateProvider>
  );
};

export default App;
