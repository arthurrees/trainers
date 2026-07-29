// glossary.js — shared glossary, rendered in sidebar
window.DMT = window.DMT || {};

DMT.glossary = {
  // Logic
  '¬':  { name: 'NOT', def: 'Negation. ¬p means "not p" — flips true to false.' },
  '∧':  { name: 'AND', def: 'Conjunction. p ∧ q is true only when both are true.' },
  '∨':  { name: 'OR',  def: 'Disjunction. p ∨ q is true when at least one is true.' },
  '⊕':  { name: 'XOR', def: 'Exclusive or. True when exactly one of p, q is true.' },
  '→':  { name: 'IMPLIES', def: 'Implication. p → q is false only when p is true and q is false.' },
  '↔':  { name: 'IFF', def: 'Biconditional. p ↔ q is true when p and q have the same value.' },
  '≡':  { name: 'equivalent', def: 'Two expressions are logically equivalent (same truth table).' },
  'T':  { name: 'true',  def: 'The constant true.' },
  'F':  { name: 'false', def: 'The constant false.' },
  '∀':  { name: 'for all',     def: '∀x P(x) means "for every x, P(x) is true".' },
  '∃':  { name: 'exists',      def: '∃x P(x) means "there is at least one x where P(x) is true".' },
  '∴':  { name: 'therefore',   def: 'Used at the end of a proof to introduce the conclusion.' },

  // Probability
  'Ω':  { name: 'sample space', def: 'The set of every possible outcome of a random experiment.' },
  'P(A)': { name: 'probability', def: 'The probability that event A occurs.' },
  'P(B|A)': { name: 'conditional probability', def: 'The probability of B given that A has already occurred.' },
  '⌈x⌉': { name: 'ceiling', def: 'Round x up to the nearest integer.' },

  // Sets
  '∈':  { name: 'is in',        def: 'x ∈ A means "x is an element of set A".' },
  '∉':  { name: 'not in',       def: 'x ∉ A means "x is not in set A".' },
  '⊆':  { name: 'subset',       def: 'A ⊆ B means every element of A is also in B.' },
  '⊂':  { name: 'proper subset',def: 'A ⊂ B means A ⊆ B and A ≠ B.' },
  '∪':  { name: 'union',        def: 'A ∪ B is the set of elements in A, B, or both.' },
  '∩':  { name: 'intersection', def: 'A ∩ B is the set of elements in BOTH A and B.' },
  '\\': { name: 'difference',   def: 'A \\ B is the elements in A but not in B.' },
  '△':  { name: 'symmetric diff', def: 'A △ B is elements in A or B but not both.' },
  '∅':  { name: 'empty set',    def: 'The set with no elements.' },
  '|A|': { name: 'cardinality', def: 'The number of elements in set A.' },
  'ℕ':  { name: 'naturals',     def: 'The natural numbers: 0, 1, 2, 3, ...' },
  'ℤ':  { name: 'integers',     def: '..., -2, -1, 0, 1, 2, ...' },
  'ℝ':  { name: 'reals',        def: 'All real numbers.' },

  // Relations & functions
  'f: A→B': { name: 'function', def: 'A function from set A to set B.' },
  'injective': { name: 'one-to-one', def: 'Different inputs always give different outputs.' },
  'surjective': { name: 'onto', def: 'Every element of B is hit by some input.' },
  'bijective': { name: 'one-to-one onto', def: 'Both injective and surjective.' },
  'reflexive':  { name: 'reflexive',  def: 'Every element is related to itself: ∀x, x R x.' },
  'symmetric':  { name: 'symmetric',  def: 'If x R y then y R x.' },
  'transitive': { name: 'transitive', def: 'If x R y and y R z then x R z.' },

  // Formal languages and machines
  'ε': { name: 'empty string', def: 'A string containing zero symbols.' },
  '⇒': { name: 'derives', def: 'One grammar-production step transforms the left string into the right string.' },
  'DFA': { name: 'deterministic finite automaton', def: 'A finite-state machine with exactly one next state for each state and input symbol.' },
  'alphabet': { name: 'alphabet', def: 'The finite set of symbols a machine or language uses as input.' },
  'accepting state': { name: 'accepting state', def: 'A state in which the machine accepts after all input has been read.' },

  // Combinatorics
  'n!':  { name: 'factorial',   def: 'n! = n × (n-1) × ... × 1. (0! = 1.)' },
  'P(n,k)': { name: 'permutations', def: 'Number of ordered arrangements of k items from n. = n!/(n-k)!' },
  'C(n,k)': { name: 'combinations', def: 'Number of ways to choose k from n (order does not matter). = n!/(k!(n-k)!)' },
  '(n choose k)': { name: 'binomial coefficient', def: 'Same as C(n,k). Often written as a stacked pair in parentheses.' },

  // Graphs
  'V': { name: 'vertices', def: 'The set of nodes in a graph.' },
  'E': { name: 'edges',    def: 'The set of connections between nodes.' },
  'deg(v)': { name: 'degree', def: 'Number of edges touching vertex v.' },
  'BFS': { name: 'breadth-first search', def: 'Explore graph level by level outward from the start.' },
  'DFS': { name: 'depth-first search', def: 'Explore as far as possible along each branch before backing up.' },

  // Proof
  'induction': { name: 'induction', def: 'Prove a statement for all n ≥ base by: (1) show it holds for the base, (2) show that if it holds for k, it also holds for k+1.' },
  'base case': { name: 'base case', def: 'The smallest value of n where you verify the statement directly.' },
  'inductive step': { name: 'inductive step', def: 'Assuming the statement is true at k, prove it is true at k+1.' }
};

DMT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new symbols this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = DMT.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + escapeHtml(entry.name) + '</span>' +
      escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
DMT.escapeHtml = escapeHtml;
