export const ACCOUNT_CATEGORIES = {
  ASSETS: 'Assets',
  LIABILITIES: 'Liabilities',
  EQUITY: 'Equity',
  REVENUE: 'Revenue',
  EXPENSES: 'Expenses'
};

export const chartOfAccounts = [
  { number: 101, name: 'Cash', category: ACCOUNT_CATEGORIES.ASSETS, normalBalance: 'debit' },
  { number: 110, name: 'Accounts Receivable', category: ACCOUNT_CATEGORIES.ASSETS, normalBalance: 'debit' },
  { number: 120, name: 'Prepaid Rent', category: ACCOUNT_CATEGORIES.ASSETS, normalBalance: 'debit' },
  { number: 130, name: 'Prepaid Insurance', category: ACCOUNT_CATEGORIES.ASSETS, normalBalance: 'debit' },
  { number: 140, name: 'Supplies', category: ACCOUNT_CATEGORIES.ASSETS, normalBalance: 'debit' },
  { number: 150, name: 'Equipment', category: ACCOUNT_CATEGORIES.ASSETS, normalBalance: 'debit' },
  { number: 155, name: 'Accumulated Depreciation - Equipment', category: ACCOUNT_CATEGORIES.ASSETS, normalBalance: 'credit' },
  { number: 201, name: 'Accounts Payable', category: ACCOUNT_CATEGORIES.LIABILITIES, normalBalance: 'credit' },
  { number: 220, name: 'Salaries Payable', category: ACCOUNT_CATEGORIES.LIABILITIES, normalBalance: 'credit' },
  { number: 250, name: 'Notes Payable', category: ACCOUNT_CATEGORIES.LIABILITIES, normalBalance: 'credit' },
  { number: 255, name: 'Interest Payable', category: ACCOUNT_CATEGORIES.LIABILITIES, normalBalance: 'credit' },
  { number: 301, name: 'Common Stock', category: ACCOUNT_CATEGORIES.EQUITY, normalBalance: 'credit' },
  { number: 320, name: 'Retained Earnings', category: ACCOUNT_CATEGORIES.EQUITY, normalBalance: 'credit' },
  { number: 330, name: 'Dividends', category: ACCOUNT_CATEGORIES.EQUITY, normalBalance: 'debit' },
  { number: 350, name: 'Income Summary', category: ACCOUNT_CATEGORIES.EQUITY, normalBalance: 'credit' },
  { number: 401, name: 'Service Revenue', category: ACCOUNT_CATEGORIES.REVENUE, normalBalance: 'credit' },
  { number: 501, name: 'Salaries Expense', category: ACCOUNT_CATEGORIES.EXPENSES, normalBalance: 'debit' },
  { number: 510, name: 'Rent Expense', category: ACCOUNT_CATEGORIES.EXPENSES, normalBalance: 'debit' },
  { number: 520, name: 'Insurance Expense', category: ACCOUNT_CATEGORIES.EXPENSES, normalBalance: 'debit' },
  { number: 530, name: 'Depreciation Expense', category: ACCOUNT_CATEGORIES.EXPENSES, normalBalance: 'debit' },
  { number: 540, name: 'Interest Expense', category: ACCOUNT_CATEGORIES.EXPENSES, normalBalance: 'debit' },
  { number: 550, name: 'Supplies Expense', category: ACCOUNT_CATEGORIES.EXPENSES, normalBalance: 'debit' },
  { number: 560, name: 'Utilities Expense', category: ACCOUNT_CATEGORIES.EXPENSES, normalBalance: 'debit' },
];

export const getAccountByNumber = (number) => chartOfAccounts.find(acc => acc.number === number);
export const getAccountsByCategory = (category) => chartOfAccounts.filter(acc => acc.category === category);
export const getAccountOptions = () => chartOfAccounts.map(acc => ({ value: acc.number, label: `${acc.number} - ${acc.name}` }));
