import React, { useRef, useEffect, useState } from 'react';
import { useAppState } from '../state/AppStateProvider';
import { ACCOUNT_CATEGORIES, getAccountsByCategory, getAccountByNumber } from '../domain/chartOfAccounts';
import { calculateAccountBalance, calculateFinancialStatementBalance, calculateFinancialStatementBalanceByCategory } from '../domain/accountingMath';

export const StatementsTab = () => {
  const { state } = useAppState();
  const containerRef = useRef(null);
  const netIncomeISAmountRef = useRef(null);
  const netIncomeSCREAmountRef = useRef(null);
  const endingRE_SCRE_AmountRef = useRef(null);
  const retainedEarningsBSAmountRef = useRef(null);
  const incomeStatementSectionRef = useRef(null);
  const statementOfChangesSectionRef = useRef(null);
  const balanceSheetSectionRef = useRef(null);
  const [arrow1Progress, setArrow1Progress] = useState(0);
  const [arrow2Progress, setArrow2Progress] = useState(0);
  const [containerDimensions, setContainerDimensions] = useState({ width: 0, height: 0 });
  const accountBalances = {};

  // Only include entries that are not closing entries (use Adjusted Trial Balance)
  state.postedEntries
    .filter(entry => !entry.isClosing)
    .forEach(entry => {
      entry.lines.forEach(line => {
        const accountNum = line.account;
        if (!accountBalances[accountNum]) accountBalances[accountNum] = { debits: 0, credits: 0 };
        accountBalances[accountNum].debits += line.debit;
        accountBalances[accountNum].credits += line.credit;
      });
    });

  let totalRevenue = 0, totalExpenses = 0;

  getAccountsByCategory(ACCOUNT_CATEGORIES.REVENUE).forEach(account => {
    const balance = accountBalances[account.number];
    if (balance) totalRevenue += calculateAccountBalance(account.normalBalance, balance.debits, balance.credits);
  });

  getAccountsByCategory(ACCOUNT_CATEGORIES.EXPENSES).forEach(account => {
    const balance = accountBalances[account.number];
    if (balance) totalExpenses += calculateAccountBalance(account.normalBalance, balance.debits, balance.credits);
  });

  const netIncome = totalRevenue - totalExpenses;

  const getCategoryTotal = (category) => {
    return getAccountsByCategory(category).reduce((sum, account) => {
      const balance = accountBalances[account.number];
      if (balance) return sum + calculateFinancialStatementBalanceByCategory(account.category, balance.debits, balance.credits);
      return sum;
    }, 0);
  };

  // Calculate Retained Earnings balances
  const retainedEarningsAccount = getAccountByNumber(320);
  const retainedEarningsBalance = retainedEarningsAccount && accountBalances[320] 
    ? calculateFinancialStatementBalanceByCategory(retainedEarningsAccount.category, accountBalances[320].debits, accountBalances[320].credits)
    : 0;
  const beginningRetainedEarnings = retainedEarningsBalance;

  // Calculate Dividends
  const dividendsAccount = getAccountByNumber(330);
  const dividends = dividendsAccount && accountBalances[330]
    ? calculateFinancialStatementBalanceByCategory(dividendsAccount.category, accountBalances[330].debits, accountBalances[330].credits)
    : 0;
  // Dividends are equity accounts, so if negative it means dividends were paid (debit balance)
  // For equity: credits - debits, so if debits > credits, result is negative
  const dividendsPaid = dividends < 0 ? Math.abs(dividends) : 0;

  // Calculate ending Retained Earnings
  const endingRetainedEarnings = beginningRetainedEarnings + netIncome - dividendsPaid;

  const totalAssets = getCategoryTotal(ACCOUNT_CATEGORIES.ASSETS);
  const totalLiabilities = getCategoryTotal(ACCOUNT_CATEGORIES.LIABILITIES);
  const totalEquityBeforeRE = getAccountsByCategory(ACCOUNT_CATEGORIES.EQUITY).reduce((sum, account) => {
    // Exclude Retained Earnings and Dividends from this calculation
    // Retained Earnings: we'll add ending balance separately (which already accounts for dividends)
    // Dividends: already accounted for in ending retained earnings calculation
    if (account.number === 320 || account.number === 330) return sum;
    const balance = accountBalances[account.number];
    if (balance) return sum + calculateFinancialStatementBalanceByCategory(account.category, balance.debits, balance.credits);
    return sum;
  }, 0);
  const totalEquity = totalEquityBeforeRE + endingRetainedEarnings;
  const totalLiabilitiesAndEquity = totalLiabilities + totalEquity;

  const hasPostings = state.postedEntries.length > 0;

  // Format number to whole dollars with comma separators and parentheses for negatives
  // Dollar sign goes inside parentheses for negatives: ($5,000) not $(5,000)
  const formatCurrency = (amount) => {
    const rounded = Math.round(amount);
    if (rounded < 0) {
      const absValue = Math.abs(rounded);
      const formatted = absValue.toLocaleString('en-US', { maximumFractionDigits: 0 });
      return `($${formatted})`;
    }
    const formatted = rounded.toLocaleString('en-US', { maximumFractionDigits: 0 });
    return `$${formatted}`;
  };

  const renderAccountLine = (account, balance) => {
    const bal = calculateFinancialStatementBalanceByCategory(account.category, balance.debits, balance.credits);
    // Show account if balance is non-zero (including negative balances)
    if (Math.abs(bal) < 0.01) return null;
    const formatted = formatCurrency(bal);
    return (
      <tr key={account.number}>
        <td>{account.name}</td>
        <td className="amount-col">{formatted}</td>
      </tr>
    );
  };

  // Calculate arrow path and progress based on scroll position
  useEffect(() => {
    if (!hasPostings || !containerRef.current) return;

    const calculateArrowProgress = () => {
      const container = containerRef.current;
      if (!container) return;

      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const containerRect = container.getBoundingClientRect();
      const containerTop = containerRect.top + scrollTop;
      const containerBottom = containerTop + containerRect.height;
      const viewportTop = scrollTop;
      const viewportBottom = scrollTop + window.innerHeight;

      // Arrow 1: Income Statement Net Income -> Statement of Changes in Retained Earnings Net Income
      if (incomeStatementSectionRef.current && statementOfChangesSectionRef.current) {
        const incomeStatementRect = incomeStatementSectionRef.current.getBoundingClientRect();
        const statementOfChangesRect = statementOfChangesSectionRef.current.getBoundingClientRect();
        const incomeStatementBottomY = incomeStatementRect.bottom + scrollTop;
        const statementOfChangesBottomY = statementOfChangesRect.bottom + scrollTop;
        const gap = statementOfChangesBottomY - incomeStatementBottomY;

        if (gap > 0) {
          // Start animation when bottom of Income Statement first appears at bottom of viewport
          // Finish when bottom of Statement of Changes first appears at bottom of viewport
          const viewportHeight = window.innerHeight;
          const startTrigger = incomeStatementBottomY - viewportHeight; // Start when Income Statement bottom appears at bottom
          const endTrigger = statementOfChangesBottomY - viewportHeight; // Finish when Statement of Changes bottom appears at bottom
          const progressRange = endTrigger - startTrigger;
          
          let scrollProgress = 0;
          if (viewportTop >= endTrigger) {
            // Already scrolled past Statement of Changes bottom - show full arrow
            scrollProgress = 1;
          } else if (viewportTop >= startTrigger) {
            // In the animation range
            scrollProgress = progressRange > 0 
              ? Math.min(1, (viewportTop - startTrigger) / progressRange)
              : 0;
          }
          setArrow1Progress(scrollProgress);
        }
      }

      // Arrow 2: Statement of Changes in Retained Earnings Ending Balance -> Balance Sheet Retained Earnings
      if (statementOfChangesSectionRef.current && balanceSheetSectionRef.current) {
        const statementOfChangesRect = statementOfChangesSectionRef.current.getBoundingClientRect();
        const balanceSheetRect = balanceSheetSectionRef.current.getBoundingClientRect();
        const statementOfChangesBottomY = statementOfChangesRect.bottom + scrollTop;
        const balanceSheetBottomY = balanceSheetRect.bottom + scrollTop;
        const gap = balanceSheetBottomY - statementOfChangesBottomY;

        if (gap > 0) {
          // Start animation when bottom of Statement of Changes first appears at bottom of viewport
          // Finish when bottom of Balance Sheet first appears at bottom of viewport
          const viewportHeight = window.innerHeight;
          const startTrigger = statementOfChangesBottomY - viewportHeight; // Start when Statement of Changes bottom appears at bottom
          const endTrigger = balanceSheetBottomY - viewportHeight; // Finish when Balance Sheet bottom appears at bottom
          const progressRange = endTrigger - startTrigger;
          
          let scrollProgress = 0;
          if (viewportTop >= endTrigger) {
            // Already scrolled past Balance Sheet bottom - show full arrow
            scrollProgress = 1;
          } else if (viewportTop >= startTrigger) {
            // In the animation range
            scrollProgress = progressRange > 0 
              ? Math.min(1, (viewportTop - startTrigger) / progressRange)
              : 0;
          }
          setArrow2Progress(scrollProgress);
        }
      }
    };

    // Update container dimensions
    const updateDimensions = () => {
      if (containerRef.current) {
        // Use scrollHeight to get full content height, not just viewport height
        const width = containerRef.current.offsetWidth;
        const height = containerRef.current.scrollHeight;
        setContainerDimensions({ width, height });
      }
    };

    // Initial calculations with a small delay to ensure layout is ready
    const timeoutId = setTimeout(() => {
      updateDimensions();
      calculateArrowProgress();
    }, 100);

    // Listen to scroll and resize events
    const handleScroll = () => {
      requestAnimationFrame(() => {
        calculateArrowProgress();
      });
    };

    const handleResize = () => {
      requestAnimationFrame(() => {
        updateDimensions();
        calculateArrowProgress();
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize, { passive: true });

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, [hasPostings]);

  // Calculate arrow path coordinates
  const getArrowPath = (startRef, endRef, progress, bowRight = false, endOnLeft = false, startBelow = false, endAbove = false) => {
    if (!startRef.current || !endRef.current || !containerRef.current || progress <= 0) return null;

    const containerRect = containerRef.current.getBoundingClientRect();
    const startRect = startRef.current.getBoundingClientRect();
    const endRect = endRef.current.getBoundingClientRect();

    // Calculate positions relative to container
    // Start from right side of start (dollar amount), or slightly left if startBelow
    const startX = startBelow
      ? startRect.right - 10 - containerRect.left  // Slightly left of right edge when starting below
      : startRect.right - containerRect.left;
    // Vertical position: center by default, below if startBelow is true
    const startY = startBelow 
      ? startRect.bottom + 2 - containerRect.top  // 2px below the cell (reduced from 5px)
      : startRect.top + startRect.height / 2 - containerRect.top;
    
    // End on left or right side depending on parameter
    const endX = endOnLeft 
      ? endRect.left + 5 - containerRect.left  // Slightly right of left edge
      : endRect.right - (endAbove ? 10 : 0) - containerRect.left;  // Just left of right edge when ending above
    // Vertical position: center by default, above if endAbove is true
    const endY = endAbove
      ? endRect.top - 2 - containerRect.top  // 2px above the cell (reduced from 5px)
      : endRect.top + endRect.height / 2 - containerRect.top;

    // Create a curved path
    let path;
    let controlX2, controlY2; // Store last control point for arrowhead angle calculation
    if (bowRight) {
      // For the first arrow, bow out to the right
      const horizontalOffset = 80; // How far to bow out to the right
      const controlX1 = startX + horizontalOffset;
      controlX2 = endX + horizontalOffset;
      const controlY1 = startY + (endY - startY) * 0.3;
      controlY2 = startY + (endY - startY) * 0.7;
      // Use a cubic bezier that bows out to the right
      path = `M ${startX} ${startY} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${endX} ${endY}`;
    } else {
      // For the second arrow, use a more subtle curve
      const controlX1 = startX + (endX - startX) * 0.25;
      controlX2 = startX + (endX - startX) * 0.75;
      const controlY1 = startY + (endY - startY) * 0.5;
      controlY2 = startY + (endY - startY) * 0.5;
      path = `M ${startX} ${startY} C ${controlX1} ${controlY1} ${controlX2} ${controlY2} ${endX} ${endY}`;
    }

    // Calculate arrowhead angle (direction at end of path)
    // Use the direction from the last control point to the end point
    const arrowAngle = Math.atan2(endY - controlY2, endX - controlX2) * (180 / Math.PI);
    
    // Arrowhead will be positioned at end point with base connecting to line
    // No need to calculate separate arrowhead position - we'll position it at endX, endY

    // Approximate path length for animation (cubic bezier approximation)
    const dx = endX - startX;
    const dy = endY - startY;
    const pathLength = Math.sqrt(dx * dx + dy * dy) * 1.2; // Approximate multiplier for curve
    const animatedLength = pathLength * progress;

    return { path, startX, startY, endX, endY, animatedLength, pathLength, arrowAngle };
  };

  const arrow1Data = getArrowPath(netIncomeISAmountRef, netIncomeSCREAmountRef, arrow1Progress, true, false, false, false); // First arrow bows right, ends on right
  const arrow2Data = getArrowPath(endingRE_SCRE_AmountRef, retainedEarningsBSAmountRef, arrow2Progress, false, false, true, true); // Second arrow: start below, end above, ends just left of right edge

  return (
    <div className="tab-content">
      <h2>Financial Statements</h2>
      <p className="section-description">
        Financial statements are automatically generated from the ledger.
        The Income Statement shows profitability (Revenue - Expenses = Net Income).
        The Balance Sheet shows financial position (Assets = Liabilities + Equity).
      </p>

      {!hasPostings && (
        <div className="empty-state">
          <p>Post journal entries in the General Journal tab to see financial statements here.</p>
        </div>
      )}

      {hasPostings && (
        <div ref={containerRef} className="statements-container">
          <section ref={incomeStatementSectionRef} className="statement-section">
            <h3>Income Statement</h3>
            <div className="company-name">TechSolutions Consulting Inc.</div>
            <div className="statement-period">For the Period Ended December 31, 2024</div>
            <table className="financial-statement">
              <thead>
                <tr>
                  <th>Revenue</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {getAccountsByCategory(ACCOUNT_CATEGORIES.REVENUE).map(account => {
                  const balance = accountBalances[account.number];
                  return balance ? renderAccountLine(account, balance) : null;
                })}
                <tr className="subtotal-row">
                  <td>Total Revenue</td>
                  <td className="amount-col">{formatCurrency(totalRevenue)}</td>
                </tr>
              </tbody>
              <thead>
                <tr>
                  <th>Expenses</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {getAccountsByCategory(ACCOUNT_CATEGORIES.EXPENSES).map(account => {
                  const balance = accountBalances[account.number];
                  return balance ? renderAccountLine(account, balance) : null;
                })}
                <tr className="subtotal-row">
                  <td>Total Expenses</td>
                  <td className="amount-col">{formatCurrency(totalExpenses)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="total-row arrow-source">
                  <td>Net Income</td>
                  <td ref={netIncomeISAmountRef} className="amount-col">{formatCurrency(netIncome)}</td>
                </tr>
              </tfoot>
            </table>
          </section>

          <section ref={statementOfChangesSectionRef} className="statement-section">
            <h3>Statement of Changes in Retained Earnings</h3>
            <div className="company-name">TechSolutions Consulting Inc.</div>
            <div className="statement-period">For the Period Ended December 31, 2024</div>
            <table className="financial-statement">
              <tbody>
                <tr>
                  <td>Beginning Retained Earnings</td>
                  <td className="amount-col">{formatCurrency(beginningRetainedEarnings)}</td>
                </tr>
                <tr className="arrow-target">
                  <td>Add: Net Income</td>
                  <td ref={netIncomeSCREAmountRef} className="amount-col">{formatCurrency(netIncome)}</td>
                </tr>
                {dividendsPaid > 0 && (
                  <tr>
                    <td>Less: Dividends</td>
                    <td className="amount-col">{formatCurrency(-dividendsPaid)}</td>
                  </tr>
                )}
                <tr className="total-row arrow-source">
                  <td>Ending Retained Earnings</td>
                  <td ref={endingRE_SCRE_AmountRef} className="amount-col">{formatCurrency(endingRetainedEarnings)}</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section ref={balanceSheetSectionRef} className="statement-section balance-sheet-section">
            <h3>Balance Sheet</h3>
            <div className="company-name">TechSolutions Consulting Inc.</div>
            <div className="statement-period">As of December 31, 2024</div>
            <div className="balance-sheet-container">
              <div className="balance-sheet-column">
                <table className="financial-statement">
                  <thead>
                    <tr>
                      <th>Assets</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAccountsByCategory(ACCOUNT_CATEGORIES.ASSETS).map(account => {
                      const balance = accountBalances[account.number];
                      return balance ? renderAccountLine(account, balance) : null;
                    })}
                <tr className="total-row">
                  <td>Total Assets</td>
                  <td className="amount-col">{formatCurrency(totalAssets)}</td>
                </tr>
                  </tbody>
                </table>
              </div>
              <div className="balance-sheet-column">
                <table className="financial-statement">
                  <thead>
                    <tr>
                      <th>Liabilities</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAccountsByCategory(ACCOUNT_CATEGORIES.LIABILITIES).map(account => {
                      const balance = accountBalances[account.number];
                      return balance ? renderAccountLine(account, balance) : null;
                    })}
                <tr className="subtotal-row">
                  <td>Total Liabilities</td>
                  <td className="amount-col">{formatCurrency(totalLiabilities)}</td>
                </tr>
                  </tbody>
                  <thead>
                    <tr>
                      <th>Equity</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {getAccountsByCategory(ACCOUNT_CATEGORIES.EQUITY).map(account => {
                      // Skip Retained Earnings and Dividends as we'll show the ending retained earnings separately
                      // (which already accounts for dividends)
                      if (account.number === 320 || account.number === 330) return null;
                      const balance = accountBalances[account.number];
                      return balance ? renderAccountLine(account, balance) : null;
                    })}
                <tr className="arrow-target">
                  <td>Retained Earnings</td>
                  <td ref={retainedEarningsBSAmountRef} className="amount-col">{formatCurrency(endingRetainedEarnings)}</td>
                </tr>
                <tr className="total-row">
                  <td>Total Equity</td>
                  <td className="amount-col">{formatCurrency(totalEquity)}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr className="total-row">
                  <td>Total Liabilities and Equity</td>
                  <td className="amount-col">{formatCurrency(totalLiabilitiesAndEquity)}</td>
                </tr>
                    <tr className={`balance-check ${Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 ? 'balanced' : 'unbalanced'}`}>
                      <td colSpan="2">
                        {Math.abs(totalAssets - totalLiabilitiesAndEquity) < 0.01 
                          ? '✓ Assets = Liabilities + Equity' 
                          : '✗ Assets do not equal Liabilities + Equity'}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </section>

          {/* SVG Overlay for Arrow Animations */}
          {containerDimensions.width > 0 && containerDimensions.height > 0 && (
            <svg
              className="arrow-overlay"
              width={containerDimensions.width}
              height={containerDimensions.height}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                pointerEvents: 'none',
                zIndex: 10,
                overflow: 'visible',
              }}
            >
              {/* Arrow 1: Income Statement Net Income -> Statement of Changes in Retained Earnings Net Income */}
              {arrow1Data && arrow1Data.animatedLength > 0 && (
                <g>
                  <defs>
                    <marker
                      id="arrowhead1"
                      markerWidth="20"
                      markerHeight="20"
                      refX="20"
                      refY="8"
                      orient="auto"
                      markerUnits="userSpaceOnUse"
                    >
                      <polygon
                        points="0,0 20,8 0,16"
                        fill="#2563eb"
                      />
                    </marker>
                  </defs>
                  {/* Arrow line */}
                  <path
                    d={arrow1Data.path}
                    stroke="#2563eb"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={arrow1Data.pathLength}
                    strokeDashoffset={arrow1Data.pathLength - arrow1Data.animatedLength}
                    markerEnd={arrow1Data.animatedLength >= arrow1Data.pathLength * 0.99 ? "url(#arrowhead1)" : undefined}
                    style={{
                      transition: 'stroke-dashoffset 0.1s ease-out',
                    }}
                  />
                </g>
              )}

              {/* Arrow 2: Statement of Changes in Retained Earnings Ending Balance -> Balance Sheet Retained Earnings */}
              {arrow2Data && arrow2Data.animatedLength > 0 && (
                <g>
                  <defs>
                    <marker
                      id="arrowhead2"
                      markerWidth="20"
                      markerHeight="20"
                      refX="20"
                      refY="8"
                      orient="auto"
                      markerUnits="userSpaceOnUse"
                    >
                      <polygon
                        points="0,0 20,8 0,16"
                        fill="#2563eb"
                      />
                    </marker>
                  </defs>
                  {/* Arrow line */}
                  <path
                    d={arrow2Data.path}
                    stroke="#2563eb"
                    strokeWidth="3"
                    fill="none"
                    strokeDasharray={arrow2Data.pathLength}
                    strokeDashoffset={arrow2Data.pathLength - arrow2Data.animatedLength}
                    markerEnd={arrow2Data.animatedLength >= arrow2Data.pathLength * 0.99 ? "url(#arrowhead2)" : undefined}
                    style={{
                      transition: 'stroke-dashoffset 0.1s ease-out',
                    }}
                  />
                </g>
              )}
            </svg>
          )}
        </div>
      )}
    </div>
  );
};
