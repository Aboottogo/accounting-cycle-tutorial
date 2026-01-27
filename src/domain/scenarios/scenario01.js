export const scenario01 = {
  company: {
    name: 'TechSolutions Consulting Inc.',
    industry: 'Business Consulting',
    description: 'A consulting firm that provides technology and business advisory services to small and medium-sized businesses.'
  },
  initialTransactions: [
    { id: 'T1', date: '2024-01-01', description: 'On January 1, the owners invest $100,000 cash in exchange for 2,000 shares of common stock.', summary: 'Owners invest $100,000 cash for 2,000 shares of common stock.' },
    { id: 'T2', date: '2024-01-05', description: 'On January 5, the company takes out a $20,000 cash loan from the bank.', summary: 'Borrow $20,000 cash from the bank.' },
    { id: 'T3', date: '2024-01-12', description: 'On January 12, the company provided consulting services to a customer in exchange for $6,000 of cash.', summary: 'Consulting services, $6,000 cash received.' },
    { id: 'T4', date: '2024-01-15', description: 'On January 15, the company purchased office equipment for $15,000 cash.', summary: 'Purchase office equipment, $15,000 cash.' },
    { id: 'T5', date: '2024-01-18', description: 'On January 18, the company provided consulting services worth $8,500 on account (customer will pay later).', summary: 'Consulting services $8,500 on account.' },
    { id: 'T6', date: '2024-01-20', description: 'On January 20, the company received $4,000 cash from a customer who had purchased services on account earlier.', summary: 'Collect $4,000 cash from customer on account.' },
    { id: 'T7', date: '2024-01-22', description: 'On January 22, the company purchased office supplies for $1,200 cash.', summary: 'Purchase office supplies, $1,200 cash.' },
    { id: 'T8', date: '2024-01-25', description: 'On January 25, the company paid $3,000 cash for three months of rent in advance.', summary: 'Pay $3,000 for 3 months rent in advance.' },
    { id: 'T9', date: '2024-01-28', description: 'On January 28, the company paid $2,400 cash for one year of insurance in advance.', summary: 'Pay $2,400 for 1 year insurance in advance.' },
    { id: 'T10', date: '2024-02-05', description: 'On February 5, the company provided consulting services worth $12,000 in exchange for cash.', summary: 'Consulting services $12,000 cash.' },
    { id: 'T11', date: '2024-02-10', description: 'On February 10th, the company declared and paid a $5,000 cash dividend to shareholders.', summary: 'Declare and pay $5,000 cash dividend.' },
    { id: 'T12', date: '2024-02-15', description: 'On February 15, the company collected $6,500 cash from customers who had purchased services on account.', summary: 'Collect $6,500 from customers on account.' },
    { id: 'T13', date: '2024-02-20', description: 'On February 20, the company paid $2,800 cash for employee salaries.', summary: 'Pay $2,800 employee salaries.' },
    { id: 'T14', date: '2024-02-25', description: 'On February 25, the company provided consulting services worth $9,000 on account.', summary: 'Consulting services $9,000 on account.' },
    { id: 'T15', date: '2024-02-28', description: 'On February 28, the company paid $450 cash for utilities.', summary: 'Pay $450 utilities.' }
  ],
  adjustingScenarios: [
    { id: 'A1', date: '2024-12-31', description: 'On December 31, depreciation expense for equipment is $500.', summary: 'Depreciation on equipment, $500.' },
    { id: 'A2', date: '2024-12-31', description: 'On December 31, employees have earned $2,000 in wages that will be paid in January.', summary: 'Accrued wages $2,000 (paid in January).' },
    { id: 'A3', date: '2024-12-31', description: 'On December 31, one month of prepaid rent has expired (rent was $3,000 for 3 months).', summary: 'One month prepaid rent expired ($3,000 ÷ 3).' },
    { id: 'A4', date: '2024-12-31', description: 'On December 31, one month of prepaid insurance has expired (insurance was $2,400 for 12 months).', summary: 'One month prepaid insurance expired ($2,400 ÷ 12).' },
    { id: 'A5', date: '2024-12-31', description: 'On December 31, the company owes $300 in interest on the bank loan (interest rate: 6% annually on $20,000 for 3 months).', summary: 'Accrued interest on bank loan, $300.' }
  ],
  closingScenarios: [
    { id: 'C1', date: '2024-12-31', description: 'Close revenue accounts to Income Summary' },
    { id: 'C2', date: '2024-12-31', description: 'Close expense accounts to Income Summary' },
    { id: 'C3', date: '2024-12-31', description: 'Close Income Summary to Retained Earnings' },
    { id: 'C4', date: '2024-12-31', description: 'Close Dividends to Retained Earnings (if applicable)' }
  ],
  solutions: {
    T1: { 101: { debits: 100000, credits: 0 }, 301: { debits: 0, credits: 100000 } },
    T2: { 101: { debits: 20000, credits: 0 }, 250: { debits: 0, credits: 20000 } },
    T3: { 101: { debits: 6000, credits: 0 }, 401: { debits: 0, credits: 6000 } },
    T4: { 150: { debits: 15000, credits: 0 }, 101: { debits: 0, credits: 15000 } },
    T5: { 110: { debits: 8500, credits: 0 }, 401: { debits: 0, credits: 8500 } },
    T6: { 101: { debits: 4000, credits: 0 }, 110: { debits: 0, credits: 4000 } },
    T7: { 140: { debits: 1200, credits: 0 }, 101: { debits: 0, credits: 1200 } },
    T8: { 120: { debits: 3000, credits: 0 }, 101: { debits: 0, credits: 3000 } },
    T9: { 130: { debits: 2400, credits: 0 }, 101: { debits: 0, credits: 2400 } },
    T10: { 101: { debits: 12000, credits: 0 }, 401: { debits: 0, credits: 12000 } },
    T11: { 330: { debits: 5000, credits: 0 }, 101: { debits: 0, credits: 5000 } },
    T12: { 101: { debits: 6500, credits: 0 }, 110: { debits: 0, credits: 6500 } },
    T13: { 501: { debits: 2800, credits: 0 }, 101: { debits: 0, credits: 2800 } },
    T14: { 110: { debits: 9000, credits: 0 }, 401: { debits: 0, credits: 9000 } },
    T15: { 560: { debits: 450, credits: 0 }, 101: { debits: 0, credits: 450 } },
    A1: { 530: { debits: 500, credits: 0 }, 155: { debits: 0, credits: 500 } },
    A2: { 501: { debits: 2000, credits: 0 }, 220: { debits: 0, credits: 2000 } },
    A3: { 510: { debits: 1000, credits: 0 }, 120: { debits: 0, credits: 1000 } },
    A4: { 520: { debits: 200, credits: 0 }, 130: { debits: 0, credits: 200 } },
    A5: { 540: { debits: 300, credits: 0 }, 255: { debits: 0, credits: 300 } }
  }
};

export const getSolution = (transactionId) => scenario01.solutions[transactionId] || {};

/**
 * Calculates closing entry solutions based on adjusted trial balance
 * @param {number} closeIndex - The index of the closing entry (0-based: 0=first, 1=second, 2=third, 3=fourth)
 * @param {Array} postedEntries - All posted journal entries (excluding closing entries)
 * @returns {Object} Solution object with account numbers as keys and {debits, credits} as values
 */
export const getClosingEntrySolution = (closeIndex, postedEntries) => {
  // Calculate adjusted balances from posted entries (excluding closing entries)
  const adjustedBalances = {};
  
  postedEntries
    .filter(entry => !entry.isClosing)
    .forEach(entry => {
      entry.lines.forEach(line => {
        const accountNum = parseInt(line.account);
        if (!adjustedBalances[accountNum]) {
          adjustedBalances[accountNum] = { debits: 0, credits: 0 };
        }
        adjustedBalances[accountNum].debits += parseFloat(line.debit) || 0;
        adjustedBalances[accountNum].credits += parseFloat(line.credit) || 0;
      });
    });

  // Use closeIndex directly (0-based: 0=first entry, 1=second, 2=third, 3=fourth)
  const closeNum = closeIndex + 1;

  // Calculate revenue total (account 401)
  const revenueBalance = adjustedBalances[401] || { debits: 0, credits: 0 };
  const revenueTotal = Math.max(0, revenueBalance.credits - revenueBalance.debits);

  // Calculate expense totals
  const expenseAccounts = [501, 510, 520, 530, 540, 560];
  const expenseTotals = {};
  let totalExpenses = 0;
  expenseAccounts.forEach(accNum => {
    const balance = adjustedBalances[accNum] || { debits: 0, credits: 0 };
    const expenseAmount = Math.max(0, balance.debits - balance.credits);
    if (expenseAmount > 0) {
      expenseTotals[accNum] = expenseAmount;
      totalExpenses += expenseAmount;
    }
  });

  // Calculate net income
  const netIncome = revenueTotal - totalExpenses;

  // Calculate dividends (account 330)
  const dividendsBalance = adjustedBalances[330] || { debits: 0, credits: 0 };
  const dividendsTotal = Math.max(0, dividendsBalance.debits - dividendsBalance.credits);

  // Return solution based on closing entry number
  switch (closeNum) {
    case 1:
      // Close revenue accounts to Income Summary
      if (revenueTotal > 0) {
        return {
          401: { debits: revenueTotal, credits: 0 },
          350: { debits: 0, credits: revenueTotal }
        };
      }
      return {};

    case 2:
      // Close expense accounts to Income Summary
      if (totalExpenses > 0) {
        const solution = {
          350: { debits: totalExpenses, credits: 0 }
        };
        expenseAccounts.forEach(accNum => {
          if (expenseTotals[accNum] > 0) {
            solution[accNum] = { debits: 0, credits: expenseTotals[accNum] };
          }
        });
        return solution;
      }
      return {};

    case 3:
      // Close Income Summary to Retained Earnings
      if (netIncome !== 0) {
        if (netIncome > 0) {
          return {
            350: { debits: netIncome, credits: 0 },
            320: { debits: 0, credits: netIncome }
          };
        } else {
          // Net loss
          return {
            320: { debits: Math.abs(netIncome), credits: 0 },
            350: { debits: 0, credits: Math.abs(netIncome) }
          };
        }
      }
      return {};

    case 4:
      // Close Dividends to Retained Earnings
      if (dividendsTotal > 0) {
        return {
          320: { debits: dividendsTotal, credits: 0 },
          330: { debits: 0, credits: dividendsTotal }
        };
      }
      return {};

    default:
      return {};
  }
};
