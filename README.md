# Accounting Cycle Learning App

An educational web application built with React and Vite to help introductory accounting students learn the accounting cycle. Students work through transactions, journal entries, general ledger, adjusting entries, worksheet, and financial statements in an interactive environment.

## Features

- **5 Main Tabs**: Transactions, General Journal, General Ledger, Worksheet, and Financial Statements
- **Interactive Journal Entries**: Multi-line entry forms with real-time balance validation
- **T-Account Ledger**: Visual representation of accounts with running balances
- **Worksheet**: Automatic generation of unadjusted and adjusted trial balances
- **Financial Statements**: Auto-generated Income Statement and Balance Sheet
- **Show Solution**: Individual "Show Solution" button on each journal entry to automatically populate the correct answer
- **User accounts**: Email-based login via InstantDB Magic Codes (passwordless); sign in once and your progress is saved in the cloud
- **Auto-Save**: Progress automatically saved to InstantDB (and localStorage as backup) so you can resume where you left off
- **Progress Tracking**: Visual indicator showing completion percentage

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone or download this project
2. Install dependencies:

```bash
npm install
```

3. **(Optional)** Set the InstantDB App ID via environment variable. The app uses the public App ID by default; to override, create a `.env` file in the project root:

```
VITE_INSTANT_APP_ID=your-instant-app-id
```

4. **(One-time)** Push the schema and permissions to your Instant app (requires an [Instant](https://instantdb.com/dash) account and logging in via the CLI):

```bash
npx instant-cli@latest init
```

Follow the prompts to link this project to your Instant app (App ID `566ffee5-e773-4b68-a132-29678f8f6eea` or your own). Then push the schema and permissions:

```bash
npx instant-cli@latest push schema
npx instant-cli@latest push perms
```

Magic Code email login is enabled by default for Instant apps; you can customize the magic-code email template and sender in the Instant dashboard under Auth / Emails.

### Running the App

Start the development server:

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or another port if 5173 is in use).

### Building for Production

To create a production build:

```bash
npm run build
```

To preview the production build:

```bash
npm run preview
```

## Project Structure

```
src/
├── domain/                    # Business logic and data
│   ├── chartOfAccounts.js    # Chart of accounts definition
│   ├── scenarios/            # Transaction scenarios
│   │   └── scenario01.js     # First scenario (company, transactions, solutions)
│   └── accountingMath.js     # Accounting calculation helpers
├── lib/
│   └── db.js                 # InstantDB client init
├── state/                    # State management
│   ├── AppStateProvider.jsx  # React Context provider (loads/saves progress to InstantDB)
│   ├── reducer.js            # State update logic
│   └── storage.js            # localStorage backup
├── components/               # Reusable UI components
│   ├── Tabs.jsx             # Tab navigation
│   ├── ProgressBar.jsx      # Progress indicator
│   ├── StatusPill.jsx       # Status badges
│   └── Login.jsx            # Magic Code auth (email + code)
├── tabs/                     # Main tab components
│   ├── TransactionsTab.jsx  # Transaction list display
│   ├── JournalTab.jsx       # Journal entry forms
│   ├── LedgerTab.jsx        # T-accounts display
│   ├── WorksheetTab.jsx     # Trial balance worksheet
│   └── StatementsTab.jsx    # Financial statements
├── App.jsx                   # Main app component
├── main.jsx                  # Application entry point
└── styles.css                # Global styles
```

## How It Works

### Data Flow

1. **Transactions** → Students review transaction narratives
2. **Journal** → Students record journal entries with debits and credits
3. **Ledger** → Posted journal entries automatically populate T-accounts
4. **Worksheet** → Trial balances are calculated from ledger balances
5. **Statements** → Financial statements are generated from account balances

### Key Accounting Concepts

- **Double-Entry Bookkeeping**: Every transaction affects at least two accounts, with debits = credits
- **Normal Balances**: Assets and expenses have debit normal balances; liabilities, equity, and revenue have credit normal balances
- **Adjusting Entries**: Record events that have occurred but haven't been captured in regular transactions
- **Trial Balance**: Verifies that debits equal credits before preparing financial statements
- **Financial Statements**: Income Statement shows profitability; Balance Sheet shows financial position

## Extending the App

### Adding New Scenarios

1. Create a new file in `src/domain/scenarios/` (e.g., `scenario02.js`)
2. Follow the same structure as `scenario01.js`:
   - Company context
   - Initial transactions array
   - Adjusting scenarios array
   - Solutions object with account totals
3. Update `App.jsx` to import and use the new scenario

### Adding New Accounts

Edit `src/domain/chartOfAccounts.js` and add account objects to the `chartOfAccounts` array.

### Modifying the Solution Checking

The solution comparison logic is in `src/domain/accountingMath.js`. The `compareToSolution` function uses "equivalent totals per account" - it compares the sum of debits and credits per account rather than requiring exact line matching.

## Technical Notes

- Uses React Context + useReducer for state management (beginner-friendly alternative to Redux)
- Authentication: InstantDB Magic Codes (passwordless email login); see [Instant Auth docs](https://instantdb.com/docs/auth/magic-codes)
- Progress is stored in InstantDB per user and synced when signed in; localStorage is used as a local backup
- Schema and permissions are in `instant.schema.js` and `instant.perms.js` (push to Instant via CLI)
- All calculations are derived from posted entries (single source of truth)
- Responsive design works on laptop and tablet screens

## License

Educational use - feel free to modify and extend for your teaching needs.
