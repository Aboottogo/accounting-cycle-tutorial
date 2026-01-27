export const calculateAccountBalance = (normalBalance, totalDebits, totalCredits) => {
  if (normalBalance === 'debit') {
    return Math.max(0, totalDebits - totalCredits);
  } else {
    return Math.max(0, totalCredits - totalDebits);
  }
};

/**
 * Calculates account balance for financial statements, allowing negative balances.
 * This is used for contra-accounts and accounts with abnormal balances.
 * @param {string} normalBalance - 'debit' or 'credit'
 * @param {number} totalDebits - Total debits for the account
 * @param {number} totalCredits - Total credits for the account
 * @returns {number} The actual balance (can be negative)
 */
export const calculateFinancialStatementBalance = (normalBalance, totalDebits, totalCredits) => {
  if (normalBalance === 'debit') {
    return totalDebits - totalCredits;
  } else {
    return totalCredits - totalDebits;
  }
};

/**
 * Calculates account balance for financial statements based on account category.
 * Assets: debit balances are positive, credit balances are negative.
 * Liabilities/Equity: credit balances are positive, debit balances are negative.
 * @param {string} category - Account category ('Assets', 'Liabilities', 'Equity', etc.)
 * @param {number} totalDebits - Total debits for the account
 * @param {number} totalCredits - Total credits for the account
 * @returns {number} The balance for financial statement display (can be negative)
 */
export const calculateFinancialStatementBalanceByCategory = (category, totalDebits, totalCredits) => {
  if (category === 'Assets') {
    // For assets: debits - credits (credit balances show as negative)
    return totalDebits - totalCredits;
  } else {
    // For liabilities and equity: credits - debits (debit balances show as negative)
    return totalCredits - totalDebits;
  }
};

export const sumDebits = (lines) => lines.reduce((sum, line) => sum + Math.round(parseFloat(line.debit) || 0), 0);
export const sumCredits = (lines) => lines.reduce((sum, line) => sum + Math.round(parseFloat(line.credit) || 0), 0);
export const isEntryBalanced = (lines) => Math.abs(sumDebits(lines) - sumCredits(lines)) < 0.01;

export const compareToSolution = (studentLines, solution) => {
  if (!studentLines || studentLines.length === 0) return { isCorrect: false, details: { error: 'No entry provided' } };
  if (!solution || Object.keys(solution).length === 0) return { isCorrect: false, details: { error: 'No solution available' } };

  const studentTotals = {};
  studentLines.forEach(line => {
    const accountNum = line.account;
    if (!studentTotals[accountNum]) studentTotals[accountNum] = { debits: 0, credits: 0 };
    studentTotals[accountNum].debits += parseFloat(line.debit) || 0;
    studentTotals[accountNum].credits += parseFloat(line.credit) || 0;
  });

  const allAccounts = new Set([...Object.keys(studentTotals).map(Number), ...Object.keys(solution).map(Number)]);
  const details = {};
  let isCorrect = true;

  for (const accountNum of allAccounts) {
    const student = studentTotals[accountNum] || { debits: 0, credits: 0 };
    const expected = solution[accountNum] || { debits: 0, credits: 0 };
    const studentDebits = Math.round(student.debits * 100) / 100;
    const studentCredits = Math.round(student.credits * 100) / 100;
    const expectedDebits = Math.round(expected.debits * 100) / 100;
    const expectedCredits = Math.round(expected.credits * 100) / 100;
    const debitMatch = Math.abs(studentDebits - expectedDebits) < 0.01;
    const creditMatch = Math.abs(studentCredits - expectedCredits) < 0.01;

    details[accountNum] = { correct: debitMatch && creditMatch, student: { debits: studentDebits, credits: studentCredits }, expected: { debits: expectedDebits, credits: expectedCredits } };
    if (!debitMatch || !creditMatch) isCorrect = false;
  }

  return { isCorrect, details };
};

export const calculateTrialBalanceTotals = (accountBalances) => {
  let totalDebits = 0, totalCredits = 0;
  Object.values(accountBalances).forEach(balance => {
    if (balance.debits > balance.credits) totalDebits += balance.debits - balance.credits;
    else totalCredits += balance.credits - balance.debits;
  });
  return { totalDebits, totalCredits, isBalanced: Math.abs(totalDebits - totalCredits) < 0.01 };
};

/**
 * Validates that debit rows come before credit rows in a journal entry
 * @param {Array} lines - journal entry lines
 * @returns {boolean} - true if all debits come before credits
 */
export const validateDebitCreditOrder = (lines) => {
  let foundCredit = false;
  for (const line of lines) {
    const hasDebit = parseFloat(line.debit) > 0;
    const hasCredit = parseFloat(line.credit) > 0;
    
    if (hasCredit) {
      foundCredit = true;
    }
    
    // If we've seen a credit and now see a debit, order is wrong
    if (foundCredit && hasDebit) {
      return false;
    }
  }
  return true;
};
