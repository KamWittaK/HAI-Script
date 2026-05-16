const fs = require("fs");

const ANNOTATION_PROJECT_ID = "";

function renderProgress(current, total, label = "Progress") {
  const width = 30;
  const ratio = total === 0 ? 1 : current / total;
  const filled = Math.round(width * ratio);
  const empty = width - filled;
  const percent = Math.round(ratio * 100);
  const bar = `${"#".repeat(filled)}${"-".repeat(empty)}`;

  process.stdout.write(`\r${label} [${bar}] ${current}/${total} (${percent}%)`);

  if (current === total) {
    process.stdout.write("\n");
  }
}


function buildCookieHeader() {
  const auth = JSON.parse(fs.readFileSync("auth.json", "utf8"));
  return auth.cookies
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");
}

async function fetchTasks() {
  const input = {
    "0": {
      json: {
        annotationProjectId: ANNOTATION_PROJECT_ID,
        pipelineStageId: null,
        statuses: null,
        attempters: null,
        search: null,
        limit: 1000, // change this to whatever you want assuming you have more than 1000 tasks submitted
        offset: 0,
        sortBy: "updatedAt",
        sortOrder: "desc",
        removeSkipped: true,
        statusFilter: "all",
        categories: null,
        priorityLevel: null,
      },
      meta: {
        values: {
          pipelineStageId: ["undefined"],
          statuses: ["undefined"],
          attempters: ["undefined"],
          search: ["undefined"],
          categories: ["undefined"],
          priorityLevel: ["undefined"],
        },
        v: 1,
      },
    },
  };

  const url = `https://ai.joinhandshake.com/api/trpc/task.listClaimedTasksForFellow?batch=1&input=${encodeURIComponent(JSON.stringify(input))}`;

  const res = await fetch(url, {
    headers: {
      Accept: "*/*",
      "Accept-Language": "en-US,en;q=0.9",
      Cookie: buildCookieHeader(),
    },
  });
  const data = await res.json();

  const json = data?.[0]?.result?.data?.json;
  const active = json?.activeTasks ?? [];
  const past = json?.pastTasks ?? [];
  return [...active, ...past];
}

(async () => {
  const skipDiff = process.argv.includes("--no-diff");

  let prevStages = [];
  let prevIds = [];
  if (!skipDiff) {
    try { prevStages = JSON.parse(fs.readFileSync("stages.json", "utf8")); } catch {}
    try { prevIds = JSON.parse(fs.readFileSync("ids.json", "utf8")); } catch {}
  }

  console.log("Fetching tasks...");
  const tasks = await fetchTasks();

  const prevMap = new Map(prevStages.map((r) => [r.id, r.stage]));
  const prevIdSet = new Set(prevIds);
  const seen = new Set();
  const results = [];

  for (const task of tasks) {
    if (seen.has(task.id)) continue;
    seen.add(task.id);
    const stage = task.$related?.pipelineStage?.name ?? task.pipelineStage?.name ?? "No stage found";
    results.push({ id: task.id, stage });
    renderProgress(results.length, tasks.length, "Processing");
  }

  const ids = results.map((r) => r.id);

  console.log(`Found ${results.length} tasks`);
  fs.writeFileSync("ids.json", JSON.stringify(ids, null, 2));
  fs.writeFileSync("stages.json", JSON.stringify(results, null, 2));
  console.log("Saved results to stages.json");

  const tableData = results.map(({ id, stage }) => {
    if (!skipDiff && prevStages.length > 0) {
      if (!prevIdSet.has(id)) return { id, stage: `+ ${stage}` };
      const prev = prevMap.get(id);
      if (prev !== undefined && prev !== stage) return { id, stage: `${prev} -> ${stage}` };
    }
    return { id, stage };
  });
  console.table(tableData);
})();
