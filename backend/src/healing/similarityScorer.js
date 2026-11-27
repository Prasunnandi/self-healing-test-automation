/**
 * Multi-Factor Composite DOM Heuristic Scoring Engine
 * Combines Levenshtein string metrics, Jaccard token overlaps, attribute key-value pairings,
 * and structural hierarchy weights to reliably self-heal broken Playwright/Selenium test selectors.
 */

/**
 * Compute Levenshtein distance between two strings
 */
export function levenshteinDistance(a, b) {
  if (!a) return (b || '').length;
  if (!b) return a.length;

  const m = a.length;
  const n = b.length;
  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,      // deletion
        dp[i][j - 1] + 1,      // insertion
        dp[i - 1][j - 1] + cost // substitution
      );
    }
  }
  return dp[m][n];
}

/**
 * Compute normalized string similarity between 0.0 and 1.0
 */
export function normalizedStringSimilarity(str1, str2) {
  const s1 = (str1 || '').trim().toLowerCase();
  const s2 = (str2 || '').trim().toLowerCase();
  if (s1 === s2 && s1 !== '') return 1.0;
  if (!s1 || !s2) return 0.0;

  // Substring bonus
  if (s1.includes(s2) || s2.includes(s1)) {
    const minLen = Math.min(s1.length, s2.length);
    const maxLen = Math.max(s1.length, s2.length);
    return Number(Math.max(0.65, minLen / maxLen).toFixed(4));
  }

  const dist = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  return Number(Math.max(0, 1 - dist / maxLen).toFixed(4));
}

/**
 * Compute Jaccard set similarity between two token arrays
 */
export function jaccardSimilarity(arr1 = [], arr2 = []) {
  const set1 = new Set((arr1 || []).map((x) => String(x).toLowerCase().trim()).filter(Boolean));
  const set2 = new Set((arr2 || []).map((x) => String(x).toLowerCase().trim()).filter(Boolean));

  if (set1.size === 0 && set2.size === 0) return 1.0;
  if (set1.size === 0 || set2.size === 0) return 0.0;

  let intersectionCount = 0;
  for (const item of set1) {
    if (set2.has(item)) intersectionCount++;
  }

  const unionCount = set1.size + set2.size - intersectionCount;
  return Number((intersectionCount / unionCount).toFixed(4));
}

export class CompositeDomSimilarityScorer {
  /**
   * @param {Object} [options]
   * @param {Object} [options.weights] - Heuristic dimension weights summing to 1.0
   * @param {number} [options.healingThreshold=0.60] - Minimum composite score to accept healed candidate
   */
  constructor(options = {}) {
    this.healingThreshold = options.healingThreshold ?? 0.60;
    this.weights = options.weights || {
      tag: 0.15,
      id: 0.20,
      text: 0.25,
      attributes: 0.20,
      classes: 0.10,
      hierarchy: 0.10
    };

    // Normalize weights to guarantee sum = 1.0
    const sum = Object.values(this.weights).reduce((a, b) => a + b, 0);
    if (Math.abs(sum - 1.0) > 0.01) {
      for (const k of Object.keys(this.weights)) {
        this.weights[k] = this.weights[k] / sum;
      }
    }
  }

  /**
   * Calculate detailed composite similarity score between an expected element and a candidate
   * @param {Object} expected - Broken target element snapshot
   * @param {Object} candidate - Candidate DOM node from current page state
   * @returns {Object} Composite score and factor breakdown
   */
  scoreCandidate(expected, candidate) {
    if (!expected || !candidate) {
      return { compositeScore: 0.0, isHealed: false, breakdown: {} };
    }

    // 1. Tag Similarity
    const expTag = (expected.tag || expected.tagName || '').toLowerCase();
    const candTag = (candidate.tag || candidate.tagName || '').toLowerCase();
    let tagScore = 0.0;
    if (expTag === candTag && expTag !== '') {
      tagScore = 1.0;
    } else if (
      (['button', 'a', 'input'].includes(expTag) && ['button', 'a', 'input'].includes(candTag)) ||
      (['div', 'span', 'p'].includes(expTag) && ['div', 'span', 'p'].includes(candTag))
    ) {
      tagScore = 0.5; // Semantically related
    }

    // 2. ID Similarity
    const idScore = (expected.id && candidate.id)
      ? normalizedStringSimilarity(expected.id, candidate.id)
      : (!expected.id && !candidate.id) ? 0.8 : 0.4;

    // 3. Text / Content Similarity
    const expText = expected.text || expected.innerText || expected.textContent || '';
    const candText = candidate.text || candidate.innerText || candidate.textContent || '';
    const textScore = (expText && candText)
      ? normalizedStringSimilarity(expText, candText)
      : (!expText && !candText) ? 0.7 : 0.3;

    // 4. Attributes Similarity (data-testid, name, role, aria-label, placeholder)
    const expAttrs = expected.attributes || {};
    const candAttrs = candidate.attributes || {};
    let attrMatches = 0;
    let attrComparisons = 0;

    const criticalAttrs = ['data-testid', 'name', 'role', 'aria-label', 'placeholder', 'type', 'title'];
    for (const attr of criticalAttrs) {
      const v1 = expAttrs[attr] || expected[attr];
      const v2 = candAttrs[attr] || candidate[attr];
      if (v1 && v2) {
        attrComparisons++;
        attrMatches += normalizedStringSimilarity(v1, v2);
      }
    }
    const attributesScore = attrComparisons > 0 ? Number((attrMatches / attrComparisons).toFixed(4)) : 0.75;

    // 5. CSS Classes Jaccard Similarity
    const expClasses = Array.isArray(expected.classes)
      ? expected.classes
      : (expected.class || expected.className || '').split(' ').filter(Boolean);
    const candClasses = Array.isArray(candidate.classes)
      ? candidate.classes
      : (candidate.class || candidate.className || '').split(' ').filter(Boolean);
    const classesScore = jaccardSimilarity(expClasses, candClasses);

    // 6. DOM Hierarchy / Path Similarity
    const expPath = expected.path || expected.selector || '';
    const candPath = candidate.path || candidate.selector || '';
    const hierarchyScore = (expPath && candPath)
      ? normalizedStringSimilarity(expPath, candPath)
      : 0.6;

    // Weighted composite
    const compositeScore = Number(
      (
        tagScore * this.weights.tag +
        idScore * this.weights.id +
        textScore * this.weights.text +
        attributesScore * this.weights.attributes +
        classesScore * this.weights.classes +
        hierarchyScore * this.weights.hierarchy
      ).toFixed(4)
    );

    return {
      compositeScore,
      isHealed: compositeScore >= this.healingThreshold,
      candidateId: candidate.id || null,
      suggestedSelector: this._generateSuggestedSelector(candidate),
      breakdown: {
        tag: { score: tagScore, weight: this.weights.tag },
        id: { score: idScore, weight: this.weights.id },
        text: { score: textScore, weight: this.weights.text },
        attributes: { score: attributesScore, weight: this.weights.attributes },
        classes: { score: classesScore, weight: this.weights.classes },
        hierarchy: { score: hierarchyScore, weight: this.weights.hierarchy }
      }
    };
  }

  /**
   * Derive a clean, robust CSS selector for the candidate
   */
  _generateSuggestedSelector(node) {
    if (node.attributes && node.attributes['data-testid']) {
      return `[data-testid="${node.attributes['data-testid']}"]`;
    }
    if (node['data-testid']) {
      return `[data-testid="${node['data-testid']}"]`;
    }
    if (node.id) {
      return `#${node.id}`;
    }
    if (node.name) {
      return `[name="${node.name}"]`;
    }
    if (node.tag && node.text) {
      return `${node.tag}:has-text("${node.text.slice(0, 20)}")`;
    }
    return node.path || node.tag || 'unknown';
  }

  /**
   * Rank all DOM candidates against a broken locator target
   * @param {Object} expectedTarget
   * @param {Array<Object>} candidates
   * @returns {Object} Ranked candidates with highest confidence healing choice
   */
  findBestMatch(expectedTarget, candidates = []) {
    if (!candidates || candidates.length === 0) {
      return { bestCandidate: null, confidence: 0, candidatesRanked: [] };
    }

    const scored = candidates.map((cand) => {
      const evaluation = this.scoreCandidate(expectedTarget, cand);
      return {
        candidate: cand,
        ...evaluation
      };
    });

    scored.sort((a, b) => b.compositeScore - a.compositeScore);

    const best = scored[0];
    return {
      bestCandidate: best.isHealed ? best.candidate : null,
      confidence: best.compositeScore,
      healedSelector: best.isHealed ? best.suggestedSelector : null,
      canHeal: best.isHealed,
      candidatesRanked: scored
    };
  }
}

// Dual ESM & CommonJS compatibility
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    levenshteinDistance,
    normalizedStringSimilarity,
    jaccardSimilarity,
    CompositeDomSimilarityScorer
  };
}

export default CompositeDomSimilarityScorer;
