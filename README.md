# HAI Script

Node.js script for checking Handshake AI task stages via the HAI API.

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

## Configure

Open `main.js` and set your project ID in `ANNOTATION_PROJECT_ID`:

```js
const ANNOTATION_PROJECT_ID = "YOUR_PROJECT_ID";
```

## Run

```bash
node main.js
```

Fetches all tasks from the API and prints a table of task IDs and their current pipeline stages. On subsequent runs, shows a diff of any stage changes or new tasks since the last run.

To skip the diff:

```bash
node main.js --no-diff
```

Both generated files are ignored by git.

- `ids.json` - list of task IDs
- `stages.json` - list of `{ id, stage }` results
