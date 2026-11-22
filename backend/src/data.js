export const initialTestRuns = [
  {
    testId: "TC-E2E-101",
    suite: "Auth_Checkout_Flow",
    testCaseName: "User Checkout Submit Button",
    targetElement: "Primary Action Button",
    originalSelector: "#btn-checkout-v2",
    brokenReason: "CSS Class & Dynamic ID Mutation",
    healedSelector: "button[data-testid='complete-purchase-btn']",
    similarityScore: 0.962,
    visualDiffPct: 0.02,
    status: "HEALED",
    executionTimeMs: 842,
    ciRunId: "CI-BUILD-9921",
    gitPatch: "--- a/tests/checkout.spec.ts\n+++ b/tests/checkout.spec.ts\n- await page.click('#btn-checkout-v2');\n+ await page.click(\"button[data-testid='complete-purchase-btn']\");"
  },
  {
    testId: "TC-E2E-102",
    suite: "Subscription_Billing",
    testCaseName: "Billing Address Input Field",
    targetElement: "Street Address Line 1",
    originalSelector: "input#shipping-addr-legacy",
    brokenReason: "DOM Hierarchy Restructured",
    healedSelector: "input[name='billingAddress1']",
    similarityScore: 0.938,
    visualDiffPct: 0.00,
    status: "HEALED",
    executionTimeMs: 615,
    ciRunId: "CI-BUILD-9921",
    gitPatch: "--- a/tests/billing.spec.ts\n+++ b/tests/billing.spec.ts\n- await page.fill('input#shipping-addr-legacy', '452 Mission St');\n+ await page.fill(\"input[name='billingAddress1']\", '452 Mission St');"
  },
  {
    testId: "TC-E2E-103",
    suite: "Catalog_Search",
    testCaseName: "Search Filter Chip Dropdown",
    targetElement: "Category Pill Selector",
    originalSelector: "div.css-19xa81-filter",
    brokenReason: "Obfuscated Styled-Component Hash",
    healedSelector: "div[role='combobox'][aria-label='Filter category']",
    similarityScore: 0.915,
    visualDiffPct: 0.04,
    status: "HEALED",
    executionTimeMs: 1120,
    ciRunId: "CI-BUILD-9922",
    gitPatch: "--- a/tests/catalog.spec.ts\n+++ b/tests/catalog.spec.ts\n- await page.click('div.css-19xa81-filter');\n+ await page.click(\"div[role='combobox'][aria-label='Filter category']\");"
  },
  {
    testId: "TC-E2E-104",
    suite: "User_Profile_Settings",
    testCaseName: "Two-Factor Toggle Switch",
    targetElement: "MFA Activation Toggle",
    originalSelector: "button#mfa-toggle-old",
    brokenReason: "Attribute Deprecated",
    healedSelector: "button[aria-checked='true'][data-feature='mfa']",
    similarityScore: 0.949,
    visualDiffPct: 0.00,
    status: "HEALED",
    executionTimeMs: 490,
    ciRunId: "CI-BUILD-9922",
    gitPatch: "--- a/tests/settings.spec.ts\n+++ b/tests/settings.spec.ts\n- await page.click('button#mfa-toggle-old');\n+ await page.click(\"button[aria-checked='true'][data-feature='mfa']\");"
  },
  {
    testId: "TC-E2E-105",
    suite: "Order_History_Export",
    testCaseName: "Download CSV Export Anchor",
    targetElement: "Export Report Link",
    originalSelector: "a.btn-export-csv",
    brokenReason: "Replaced with SVG Icon Button",
    healedSelector: "button[data-action='export-csv-reports']",
    similarityScore: 0.892,
    visualDiffPct: 0.12,
    status: "HEALED",
    executionTimeMs: 780,
    ciRunId: "CI-BUILD-9923",
    gitPatch: "--- a/tests/export.spec.ts\n+++ b/tests/export.spec.ts\n- await page.click('a.btn-export-csv');\n+ await page.click(\"button[data-action='export-csv-reports']\");"
  }
];

export const initialSuitesSummary = {
  totalTests: 148,
  passedFirstAttempt: 139,
  healedAutomatically: 8,
  failedUnresolved: 1,
  flakinessRatePct: 0.67,
  avgExecutionTimeMs: 685,
  ciPassRatePct: 99.3
};
