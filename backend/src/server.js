import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { initialTestRuns, initialSuitesSummary } from './data.js';

const app = express();
const PORT = process.env.PORT || 5009;

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

let testRuns = [...initialTestRuns];
let stats = { ...initialSuitesSummary };

// Health
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'Self-Healing E2E Test Automation Engine',
    framework: 'Playwright & AST Selector Similarity',
    version: '1.0.0'
  });
});

// Stats
app.get('/api/v1/tests/stats', (req, res) => {
  res.json(stats);
});

// Runs
app.get('/api/v1/tests/runs', (req, res) => {
  res.json(testRuns);
});

// Trigger self-healing test simulation
app.post('/api/v1/tests/trigger-healing', (req, res) => {
  const { testCaseName, brokenSelector, targetElement } = req.body;
  const newId = `TC-E2E-${Math.floor(200 + Math.random() * 800)}`;
  
  const healed = {
    testId: newId,
    suite: "Dynamic_Live_Regression",
    testCaseName: testCaseName || "User Modal Confirm Button",
    targetElement: targetElement || "Dialog Action",
    originalSelector: brokenSelector || ".btn-confirm-old-v1",
    brokenReason: "Dynamic Tailwind CSS Mutation",
    healedSelector: `button[data-testid='${(testCaseName || "confirm-action").toLowerCase().replace(/\s+/g, '-')}-btn']`,
    similarityScore: 0.952,
    visualDiffPct: 0.01,
    status: "HEALED",
    executionTimeMs: 720,
    ciRunId: `CI-BUILD-${Date.now().toString().slice(-4)}`,
    gitPatch: `--- a/tests/modal.spec.ts\n+++ b/tests/modal.spec.ts\n- await page.click('${brokenSelector || ".btn-confirm-old-v1"}');\n+ await page.click("button[data-testid='confirm-action-btn']");`
  };

  testRuns.unshift(healed);
  stats.healedAutomatically += 1;
  stats.totalTests += 1;

  res.status(201).json(healed);
});

// Apply patch
app.post('/api/v1/tests/:id/apply-patch', (req, res) => {
  const test = testRuns.find(t => t.testId === req.params.id);
  if (!test) return res.status(404).json({ error: 'Test not found' });
  test.patchApplied = true;
  res.json({ message: 'Git patch applied to test repository and committed to PR branch', test });
});

app.listen(PORT, () => {
  console.log(`Self-Healing Test backend listening on port http://localhost:${PORT}`);
});
