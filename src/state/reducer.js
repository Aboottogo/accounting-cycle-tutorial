export const ACTIONS = {
  ADD_JOURNAL_LINE: 'ADD_JOURNAL_LINE',
  UPDATE_JOURNAL_LINE: 'UPDATE_JOURNAL_LINE',
  REMOVE_JOURNAL_LINE: 'REMOVE_JOURNAL_LINE',
  POST_JOURNAL_ENTRY: 'POST_JOURNAL_ENTRY',
  LOAD_SOLUTION: 'LOAD_SOLUTION',
  RESET_ALL: 'RESET_ALL',
  LOAD_STATE: 'LOAD_STATE'
};

export const initialState = {
  journalEntries: {},
  postedEntries: [],
  version: 1
};

export const appReducer = (state, action) => {
  switch (action.type) {
    case ACTIONS.ADD_JOURNAL_LINE: {
      const { transactionId } = action.payload;
      const entry = state.journalEntries[transactionId] || { date: '', lines: [], posted: false };
      return {
        ...state,
        journalEntries: {
          ...state.journalEntries,
          [transactionId]: { ...entry, lines: [...entry.lines, { id: Date.now().toString(), account: '', debit: '', credit: '' }] }
        }
      };
    }
    case ACTIONS.UPDATE_JOURNAL_LINE: {
      const { transactionId, lineId, field, value } = action.payload;
      const entry = state.journalEntries[transactionId] || { date: '', lines: [], posted: false };
      // Special handling for date updates (entry-level, not line-level)
      if (field === 'date' && lineId === 'entry-date') {
        return {
          ...state,
          journalEntries: {
            ...state.journalEntries,
            [transactionId]: { ...entry, date: value }
          }
        };
      }
      const updatedLines = entry.lines.map(line => line.id === lineId ? { ...line, [field]: value } : line);
      return {
        ...state,
        journalEntries: {
          ...state.journalEntries,
          [transactionId]: { ...entry, lines: updatedLines }
        }
      };
    }
    case ACTIONS.REMOVE_JOURNAL_LINE: {
      const { transactionId, lineId } = action.payload;
      const entry = state.journalEntries[transactionId] || { date: '', lines: [], posted: false };
      return {
        ...state,
        journalEntries: {
          ...state.journalEntries,
          [transactionId]: { ...entry, lines: entry.lines.filter(line => line.id !== lineId) }
        }
      };
    }
    case ACTIONS.POST_JOURNAL_ENTRY: {
      const { transactionId, isAdjusting, isClosing } = action.payload;
      const entry = state.journalEntries[transactionId];
      if (!entry || entry.posted) return state;
      return {
        ...state,
        journalEntries: {
          ...state.journalEntries,
          [transactionId]: { ...entry, posted: true }
        },
        postedEntries: [...state.postedEntries, {
          transactionId,
          date: entry.date || new Date().toISOString().split('T')[0],
          lines: entry.lines.map(line => ({
            account: parseInt(line.account),
            debit: Math.round(parseFloat(line.debit) || 0),
            credit: Math.round(parseFloat(line.credit) || 0)
          })),
          isAdjusting: isAdjusting || false,
          isClosing: isClosing || false
        }]
      };
    }
    case ACTIONS.LOAD_SOLUTION: {
      const { transactionId, solution, date } = action.payload;
      const entry = state.journalEntries[transactionId] || { date: date || '', lines: [], posted: false };
      // Don't load solution if already posted
      if (entry.posted) return state;
      
      // Convert solution format to journal entry lines
      // Solution format: { accountNum: { debits: X, credits: Y }, ... }
      // Need to create lines: first all debits, then all credits
      const lines = [];
      const baseTimestamp = Date.now();
      let lineCounter = 0;
      
      // First, collect all accounts with debits
      Object.entries(solution).forEach(([accountNum, totals]) => {
        if (totals.debits > 0) {
          lines.push({
            id: `${baseTimestamp}-${lineCounter++}`,
            account: accountNum,
            debit: totals.debits.toString(),
            credit: ''
          });
        }
      });
      
      // Then, collect all accounts with credits
      Object.entries(solution).forEach(([accountNum, totals]) => {
        if (totals.credits > 0) {
          lines.push({
            id: `${baseTimestamp}-${lineCounter++}`,
            account: accountNum,
            debit: '',
            credit: totals.credits.toString()
          });
        }
      });
      
      return {
        ...state,
        journalEntries: {
          ...state.journalEntries,
          [transactionId]: { ...entry, lines, date: date || entry.date }
        }
      };
    }
    case ACTIONS.RESET_ALL:
      return initialState;
    case ACTIONS.LOAD_STATE:
      return { ...action.payload, version: action.payload.version || 1 };
    default:
      return state;
  }
};
