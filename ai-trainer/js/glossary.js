// glossary.js — shared glossary, rendered in sidebar
window.AIT = window.AIT || {};

AIT.glossary = {
  // Foundations
  'AI':       { name: 'artificial intelligence', def: 'Catch-all term for machines doing tasks that "look intelligent". Marketing-heavy; the technical work is mostly machine learning.' },
  'ML':       { name: 'machine learning', def: 'The subfield of AI that learns from data instead of being explicitly programmed. Includes deep learning + classical methods (trees, SVMs, etc.).' },
  'DL':       { name: 'deep learning', def: 'ML using neural networks with many layers. The "deep" refers to depth of the layer stack.' },
  'supervised': { name: 'supervised learning', def: 'You give the model labeled examples (x, y) and ask it to predict y from x.' },
  'unsupervised': { name: 'unsupervised learning', def: 'No labels — the model finds structure (clusters, embeddings) on its own.' },
  'RL':       { name: 'reinforcement learning', def: 'An agent takes actions in an environment, gets rewards, learns a policy that maximizes long-run reward.' },

  // Linear algebra
  'scalar':   { name: 'scalar', def: 'A single number. (Confusingly, also the type of an N-dim tensor when N=0.)' },
  'vector':   { name: 'vector', def: 'A 1-D array of numbers. Length n, written like [a, b, c] or as a column.' },
  'matrix':   { name: 'matrix', def: 'A 2-D array of numbers, m rows × n columns. Written A ∈ ℝᵐˣⁿ.' },
  'tensor':   { name: 'tensor', def: 'An n-dimensional array. Vector = 1-tensor, matrix = 2-tensor. NN inputs/weights are usually tensors.' },
  'dot product': { name: 'dot product', def: 'a·b = Σ aᵢbᵢ. The single most-used operation in ML.' },
  'matmul':   { name: 'matrix multiply', def: 'A (m×n) × B (n×p) = C (m×p). Each cell C[i][j] = dot product of row i of A and column j of B.' },
  'transpose': { name: 'transpose', def: 'Aᵀ swaps rows and columns. (Aᵀ)ᵢⱼ = Aⱼᵢ.' },

  // Calculus / training
  'derivative': { name: 'derivative', def: 'df/dx — instantaneous slope of f at x. How much f changes per tiny change in x.' },
  'gradient':   { name: 'gradient', def: '∇f — vector of partial derivatives. Points in the direction of steepest ascent.' },
  'chain rule': { name: 'chain rule', def: 'For y = f(g(x)): dy/dx = f\'(g(x)) · g\'(x). The math that makes backprop work.' },
  'partial':    { name: 'partial derivative', def: '∂f/∂x — derivative w.r.t. one variable, holding others fixed.' },

  // Models & training
  'parameter': { name: 'parameter', def: 'A learnable number in the model — weights, biases. GPT-3 has 175 billion of these.' },
  'weight':    { name: 'weight', def: 'A multiplicative parameter — typically the entries of weight matrices.' },
  'bias':      { name: 'bias', def: 'An additive parameter, usually one per neuron output: y = Wx + b.' },
  'loss':      { name: 'loss function', def: 'A scalar that measures how wrong the model is. Training = minimize the loss.' },
  'MSE':       { name: 'mean squared error', def: 'Loss = (1/n) Σ (y - ŷ)². Standard for regression.' },
  'cross-entropy': { name: 'cross-entropy', def: 'Loss for classification: − Σ y log(ŷ). Penalizes confident wrong answers harshly.' },
  'gradient descent': { name: 'gradient descent', def: 'Update rule: θ ← θ − η · ∇L(θ). Take a small step downhill on the loss.' },
  'learning rate': { name: 'learning rate', def: 'η — how big a step to take. Too small = slow, too big = diverge.' },
  'epoch':     { name: 'epoch', def: 'One full pass over the training set.' },
  'batch':     { name: 'mini-batch', def: 'A subset of training examples used for one gradient step. Common sizes: 32, 64, 128.' },
  'overfitting': { name: 'overfitting', def: 'Model memorizes the training set but generalizes badly. Train loss ↓, val loss ↑.' },
  'regularization': { name: 'regularization', def: 'Anything that discourages overfitting: L1/L2 weight decay, dropout, early stopping.' },

  // Neural network bits
  'neuron':    { name: 'neuron / unit', def: 'One output: y = activation(w·x + b). The atom of a neural network.' },
  'activation': { name: 'activation function', def: 'Non-linear function applied per-neuron. Without it, the whole network collapses to one big linear map.' },
  'ReLU':      { name: 'ReLU', def: 'max(0, x). The default activation in modern hidden layers — fast, simple, works.' },
  'sigmoid':   { name: 'sigmoid', def: 'σ(x) = 1 / (1 + e⁻ˣ). Squashes to (0, 1). Used in old NNs and for binary outputs.' },
  'tanh':      { name: 'tanh', def: 'Like sigmoid but squashes to (−1, 1). Used inside LSTMs.' },
  'GELU':      { name: 'GELU', def: 'Gaussian Error Linear Unit. Smooth approx of ReLU, used in BERT, GPT-2/3.' },
  'softmax':   { name: 'softmax', def: 'Turns a vector of logits into a probability distribution. Used in classification heads.' },
  'MLP':       { name: 'multi-layer perceptron', def: 'Fully connected feed-forward network. The simplest deep architecture.' },
  'forward pass': { name: 'forward pass', def: 'Compute model(x) → ŷ by walking through layers in order.' },
  'backward pass': { name: 'backward pass', def: 'Compute gradients of loss w.r.t. every parameter, by working backward through the chain rule.' },
  'backprop':  { name: 'backpropagation', def: 'The algorithm: forward pass to compute outputs, backward pass to compute gradients, parameter update step.' },
  'optimizer': { name: 'optimizer', def: 'Algorithm that uses gradients to update parameters. SGD, momentum, Adam, AdamW.' },
  'SGD':       { name: 'SGD', def: 'Stochastic gradient descent. Plain "step in the negative gradient direction" on each mini-batch.' },
  'momentum':  { name: 'momentum', def: 'Exponential running average of past gradients — smooths the descent, avoids stalls.' },
  'Adam':      { name: 'Adam', def: 'Adaptive optimizer with per-parameter learning rates. The "default that just works".' },
  'dropout':   { name: 'dropout', def: 'Randomly zero a fraction of activations during training to prevent overfitting.' },

  // Architectures
  'CNN':       { name: 'convolutional NN', def: 'Network using shared filters that slide over inputs. Standard for images, used to be the only game in town.' },
  'filter':    { name: 'filter / kernel', def: 'A small weight tensor (e.g. 3×3) convolved with the input. Different filters detect different features.' },
  'pooling':   { name: 'pooling', def: 'Downsampling step in a CNN — max-pool or avg-pool over each window.' },
  'RNN':       { name: 'RNN', def: 'Recurrent neural network. Processes sequences one step at a time, with a hidden state. Mostly displaced by transformers.' },
  'LSTM':      { name: 'LSTM', def: 'Long short-term memory. Fancier RNN that handles long-range dependencies — until transformers did it better.' },

  // Attention / Transformers
  'attention': { name: 'attention', def: 'Mechanism where each output position takes a weighted sum over input positions, weights computed from query-key similarity.' },
  'Q':         { name: 'query (Q)', def: 'In attention: "what am I looking for?" Computed as Q = X · Wq.' },
  'K':         { name: 'key (K)', def: 'In attention: "what do I have to offer?" Computed as K = X · Wk.' },
  'V':         { name: 'value (V)', def: 'In attention: "the actual content I\'ll contribute if attended to". V = X · Wv.' },
  'self-attention': { name: 'self-attention', def: 'Attention where Q, K, V all come from the same input — every position attends to every other.' },
  'multi-head': { name: 'multi-head attention', def: 'Run attention several times in parallel with different learned projections, then concatenate.' },
  'transformer': { name: 'transformer', def: 'Architecture made of stacked blocks of (attention + FFN + norms). Powers nearly every modern LLM.' },
  'encoder':   { name: 'encoder', def: 'Transformer half that reads input bidirectionally. BERT is encoder-only.' },
  'decoder':   { name: 'decoder', def: 'Transformer half that generates output left-to-right. GPT models are decoder-only.' },
  'positional encoding': { name: 'positional encoding', def: 'Extra signal added to token embeddings so the model knows token order. Modern variants: RoPE, ALiBi.' },

  // Tokenization & embeddings
  'token':     { name: 'token', def: 'The unit an LLM actually processes. Often sub-word — "unhappiness" → ["un", "happi", "ness"].' },
  'BPE':       { name: 'byte-pair encoding', def: 'Tokenizer training algorithm: repeatedly merge the most-frequent adjacent pair until you have V tokens.' },
  'embedding': { name: 'embedding', def: 'A vector representing a discrete object (token, image, user). Trained so similar items have nearby vectors.' },
  'cosine similarity': { name: 'cosine similarity', def: 'cos(a, b) = a·b / (‖a‖ ‖b‖). Standard distance for embeddings.' },
  'vector DB': { name: 'vector database', def: 'A DB that indexes embeddings for nearest-neighbor search. Powers RAG, semantic search.' },

  // LLM training & deployment
  'pretraining': { name: 'pretraining', def: 'First training stage: predict the next token on a huge unlabeled corpus.' },
  'SFT':       { name: 'supervised fine-tuning', def: 'Stage after pretraining: train on (instruction, ideal-response) pairs.' },
  'RLHF':      { name: 'RLHF', def: 'Reinforcement Learning from Human Feedback. Uses a reward model trained on human preferences to align the LLM.' },
  'DPO':       { name: 'DPO', def: 'Direct Preference Optimization. Cuts out the explicit reward model, optimizes a simpler loss directly on preference pairs.' },
  'LoRA':      { name: 'LoRA', def: 'Low-Rank Adaptation. Fine-tune only small low-rank update matrices instead of all weights — far cheaper.' },
  'context window': { name: 'context window', def: 'Maximum number of tokens the model can see at once. GPT-4: 128K. Modern frontier: 1M+.' },
  'KV cache':  { name: 'KV cache', def: 'During generation, cache K and V for past tokens so attention is O(n) per new token instead of O(n²).' },
  'quantization': { name: 'quantization', def: 'Storing weights in fewer bits — FP32 → FP16 → INT8 → INT4. Trades a little accuracy for big speed/memory wins.' },
  'temperature': { name: 'temperature', def: 'Sampling knob: divide logits by T before softmax. T=0 → greedy. T=1 → unscaled. T>1 → flatter, more random.' },
  'top-p':     { name: 'top-p / nucleus sampling', def: 'Sample only from the smallest set of tokens whose probabilities sum to p. Adapts to confidence.' },
  'top-k':     { name: 'top-k sampling', def: 'Sample only from the k highest-probability tokens.' },
  'RAG':       { name: 'RAG', def: 'Retrieval-Augmented Generation. Retrieve relevant chunks → stuff them in the prompt → let the LLM answer.' },
  'tool use':  { name: 'tool use', def: 'LLM emits a structured "call this function" request; runtime executes; result fed back into context.' },
  'agent':     { name: 'agent', def: 'LLM + tool use + a loop. Plans, acts, observes, repeats until the task is done.' }
};

AIT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = AIT.glossary[key];
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
AIT.escapeHtml = escapeHtml;
