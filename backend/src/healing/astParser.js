/**
 * Tree-Matching AST Locator Fallback Engine
 * Parses DOM structure and computes multi-dimensional similarity to heal broken test selectors.
 */

export class DomAstParser {
  /**
   * @param {Object} [options]
   * @param {number} [options.confidenceThreshold=0.70] - Minimum similarity to accept healed candidate
   */
  constructor(options = {}) {
    this.confidenceThreshold = options.confidenceThreshold || 0.70;
  }

  /**
   * Parse flat or nested DOM node representation into structured AST nodes
   * @param {Array<Object>|Object} dom - Hierarchical or flat node representations
   * @returns {Array<Object>} Normalized AST nodes
   */
  parseDomTree(dom) {
    const rawNodes = Array.isArray(dom) ? dom : [dom];
    const flatAst = [];

    const traverse = (node, parentPath = '', depth = 0) => {
      if (!node) return;
      const currentPath = parentPath ? `${parentPath} > ${node.tag || 'div'}` : (node.tag || 'div');

      const astNode = {
        id: node.id || null,
        tag: (node.tag || 'div').toLowerCase(),
        classes: Array.isArray(node.classes) ? node.classes : (node.class ? node.class.split(' ') : []),
        attributes: node.attributes || {},
        text: (node.text || node.textContent || '').trim(),
        role: node.role || node.attributes?.role || null,
        ariaLabel: node.ariaLabel || node.attributes?.['aria-label'] || null,
        path: currentPath,
        depth
      };

      flatAst.push(astNode);

      if (Array.isArray(node.children)) {
        for (const child of node.children) {
          traverse(child, currentPath, depth + 1);
        }
      }
    };

    for (const root of rawNodes) {
      traverse(root);
    }

    return flatAst;
  }

  /**
   * Heal a broken selector against the mutated DOM AST
   * @param {Object} targetFingerprint - Previous working element attributes
   * @param {Array<Object>} currentDomAst - Parsed DOM AST from parseDomTree
   * @returns {Object} Healing outcome with suggested selector and confidence score
   */
  healLocator(targetFingerprint, currentDomAst) {
    if (!targetFingerprint || !currentDomAst || currentDomAst.length === 0) {
      throw new Error('Target fingerprint and non-empty DOM AST are required');
    }

    const scoredCandidates = currentDomAst.map(node => {
      // 1. Tag match (25%)
      const tagScore = node.tag === (targetFingerprint.tag || '').toLowerCase() ? 1.0 : 0.0;

      // 2. Text / Value match (35%)
      const textScore = this._stringSimilarity(node.text, targetFingerprint.text || '');

      // 3. Attributes / Aria match (25%)
      let attrMatches = 0;
      let attrTotal = 0;

      if (targetFingerprint.role) {
        attrTotal++;
        if (node.role === targetFingerprint.role) attrMatches++;
      }
      if (targetFingerprint.ariaLabel) {
        attrTotal++;
        if (node.ariaLabel === targetFingerprint.ariaLabel) attrMatches++;
      }
      const classOverlap = this._jaccardSimilarity(node.classes, targetFingerprint.classes || []);
      const attrScore = attrTotal > 0 ? (attrMatches / attrTotal) * 0.6 + classOverlap * 0.4 : classOverlap;

      // 4. Ancestor / Structural path similarity (15%)
      const pathScore = this._stringSimilarity(node.path, targetFingerprint.path || '');

      const confidence = (tagScore * 0.25) + (textScore * 0.35) + (attrScore * 0.25) + (pathScore * 0.15);

      return {
        node,
        confidence: Number(confidence.toFixed(3)),
        breakdown: {
          tagScore,
          textScore: Number(textScore.toFixed(3)),
          attrScore: Number(attrScore.toFixed(3)),
          pathScore: Number(pathScore.toFixed(3))
        }
      };
    });

    scoredCandidates.sort((a, b) => b.confidence - a.confidence);

    const bestMatch = scoredCandidates[0];
    const isHealed = bestMatch && bestMatch.confidence >= this.confidenceThreshold;

    let suggestedSelector = null;
    if (isHealed) {
      if (bestMatch.node.id) suggestedSelector = `#${bestMatch.node.id}`;
      else if (bestMatch.node.ariaLabel) suggestedSelector = `${bestMatch.node.tag}[aria-label="${bestMatch.node.ariaLabel}"]`;
      else if (bestMatch.node.text) suggestedSelector = `//${bestMatch.node.tag}[contains(text(), '${bestMatch.node.text}')]`;
      else suggestedSelector = bestMatch.node.path;
    }

    return {
      success: isHealed,
      originalSelector: targetFingerprint.originalSelector || 'unknown',
      healedSelector: suggestedSelector,
      confidenceScore: bestMatch ? bestMatch.confidence : 0,
      confidencePercentage: bestMatch ? Number((bestMatch.confidence * 100).toFixed(1)) : 0,
      matchedNode: bestMatch ? bestMatch.node : null,
      topCandidates: scoredCandidates.slice(0, 3)
    };
  }

  _stringSimilarity(str1, str2) {
    if (!str1 && !str2) return 1.0;
    if (!str1 || !str2) return 0.0;
    const s1 = str1.toLowerCase().trim();
    const s2 = str2.toLowerCase().trim();
    if (s1 === s2) return 1.0;
    if (s1.includes(s2) || s2.includes(s1)) return 0.8;

    // Levenshtein ratio
    const longer = s1.length > s2.length ? s1 : s2;
    const shorter = s1.length > s2.length ? s2 : s1;
    if (longer.length === 0) return 1.0;
    const editDist = this._levenshtein(s1, s2);
    return Math.max(0, (longer.length - editDist) / longer.length);
  }

  _jaccardSimilarity(arr1, arr2) {
    if ((!arr1 || arr1.length === 0) && (!arr2 || arr2.length === 0)) return 1.0;
    if (!arr1 || !arr2 || arr1.length === 0 || arr2.length === 0) return 0.0;
    const set1 = new Set(arr1);
    const set2 = new Set(arr2);
    let intersection = 0;
    for (const elem of set1) {
      if (set2.has(elem)) intersection++;
    }
    const union = new Set([...set1, ...set2]).size;
    return union === 0 ? 0 : intersection / union;
  }

  _levenshtein(a, b) {
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }
}

export default DomAstParser;
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DomAstParser;
  module.exports.DomAstParser = DomAstParser;
}
