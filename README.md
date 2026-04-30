# HAI Script

Node.js Playwright script for collecting Handshake AI task IDs and checking each task's stage.

## Setup

Install dependencies:

```bash
npm install
```

Create a saved browser session:

```bash
node saveAuth.js
```

Log in when the browser opens, then press Enter in the console. This writes `auth.json`, which is ignored by git.

## Run

```bash
node main.js
```

The main script runs headless, opens the configured project task page, clicks `Load More` until all tasks are loaded, extracts task IDs, and checks each task's stage. While it checks stages, the console shows an updating progress bar.

Generated output files:

- `ids.json`
- `stages.json`

Both output files are ignored by git.
