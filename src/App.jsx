import React, { useState } from 'react';
import { db } from './lib/db';
import { AppStateProvider, useAppState } from './state/AppStateProvider';
import { ACTIONS } from './state/reducer';
import { Tabs } from './components/Tabs';
import { ProgressBar } from './components/ProgressBar';
import { Login } from './components/Login';
import { HomeTab } from './tabs/HomeTab';
import { JournalTab } from './tabs/JournalTab';
import { LedgerTab } from './tabs/LedgerTab';
import { WorksheetTab } from './tabs/WorksheetTab';
import { StatementsTab } from './tabs/StatementsTab';
import { scenario01 } from './domain/scenarios/scenario01';

const FLASH_DURATION_MS = 2000;
/** Start each next tab’s flash this many ms after the previous one, so they overlap. */
const FLASH_STAGGER_MS = 1000;

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [flashLedgerTab, setFlashLedgerTab] = useState(false);
  const [flashWorksheetTab, setFlashWorksheetTab] = useState(false);
  const [flashStatementsTab, setFlashStatementsTab] = useState(false);
  const [journalIntroRevealed, setJournalIntroRevealed] = useState(false);
  const { state, dispatch } = useAppState();
  const { initialTransactions, adjustingScenarios } = scenario01;
  const totalInitial = initialTransactions.length;
  const totalAdjusting = adjustingScenarios.length;
  const totalClosing = 4; // There are always 4 closing entries: C1, C2, C3, C4

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset all your work? This cannot be undone.')) {
      dispatch({ type: ACTIONS.RESET_ALL });
      setJournalIntroRevealed(false);
    }
  };

  const handleEntryPosted = () => {
    setJournalIntroRevealed(true);
    setFlashLedgerTab(true);
    setTimeout(() => setFlashWorksheetTab(true), FLASH_STAGGER_MS);
    setTimeout(() => {
      setFlashLedgerTab(false);
      setFlashStatementsTab(true);
    }, FLASH_STAGGER_MS * 2);
    setTimeout(() => setFlashWorksheetTab(false), FLASH_STAGGER_MS * 3);
    setTimeout(() => setFlashStatementsTab(false), FLASH_STAGGER_MS * 4);
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

  const user = db.useUser();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Accounting Cycle Learning App</h1>
        <div className="header-controls">
          <span className="user-email">{user?.email}</span>
          <button onClick={handleReset} className="reset-btn">Reset All</button>
          <button onClick={() => db.auth.signOut()} className="sign-out-btn">Sign out</button>
        </div>
      </header>

      <ProgressBar totalInitial={totalInitial} totalAdjusting={totalAdjusting} totalClosing={totalClosing} />

      <Tabs activeTab={activeTab} onTabChange={setActiveTab} flashLedgerTab={flashLedgerTab} flashWorksheetTab={flashWorksheetTab} flashStatementsTab={flashStatementsTab} />

      <main className="app-main">
        {activeTab === 'journal' && journalIntroRevealed && (
          <p className="journal-intro-banner">Entries posted to the general ledger automatically update the worksheet and financial statements.</p>
        )}
        {renderTabContent()}
      </main>

      <footer className="app-footer">
        <p>Educational tool for learning the accounting cycle</p>
      </footer>
    </div>
  );
};

const App = () => {
  const { isLoading, error } = db.useAuth();

  if (isLoading) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p className="login-text">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="login-screen">
        <div className="login-card">
          <p className="login-text" style={{ color: 'var(--error-color)' }}>Error: {error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <db.SignedIn>
        <AppStateProvider>
          <AppContent />
        </AppStateProvider>
      </db.SignedIn>
      <db.SignedOut>
        <Login />
      </db.SignedOut>
    </>
  );
};

export default App;
