# AI Trainer

In-depth interactive trainer for AI / ML / deep learning. 21 levels, 63 puzzles, covering math foundations through modern LLM mechanics plus a plain-English wrap-up. The user is hands-on with AI (running Ollama locally on RTX 3070, building Francis) and chose this trainer for **depth, not surface**.

> **Cross-trainer rules** (file layout, Learn → Play → Try shape, naming, loading order, canvas patterns, scaffolding) live in `../CLAUDE.md`. This file covers only what's specific to ML.

## Topic-specific things

- **Namespace:** `window.AIT` &nbsp; · &nbsp; **Storage key:** `ait_state_v1`
- **Run it:** open `index.html` directly. State persists in `localStorage`.
- **Defaults to deep, not hand-wavy.** This is the user's chosen "depth" trainer. If a level says "compute the gradient", show the chain rule step by step. If it talks about Q/K/V, give a worked example with concrete numbers. If you find yourself writing "and then magic happens", stop and write the math.
- **Tie back to the user's RTX 3070 / Ollama setup** where directly relevant — quantization (level 18), inference details (17, 18), tool/agent patterns (19) all reference Francis. Don't strip those references when editing.

## Topic-specific libraries

- **`AIT.lib.mat`** — minimal matrix/vector math used by levels 1, 7, 8, 12, 15:
  - `dot(a, b)`, `matmul(A, B)`, `matvec(A, x)`, `transpose(A)`
  - Vector ops: `vecAdd`, `vecSub`, `vecScale`, `vecNorm`, `cosine(a, b)`
  - `softmax(v)` (numerically stable — subtracts max before exp)
  - `shape(M)`, `round(M, digits)` for display
  - Verified via Node smoke test (8 cases).
- **`AIT.lib.canvas`** — `pos(canvas, evt)` for click hit-testing, `scale` / `unscale` for value↔pixel mapping. Used by every level with a canvas Play surface.

## The 21 levels (5 tracks)

| # | Title | Play surface |
|---|---|---|
| **Track 1: Math foundations** |
| 0 | Orientation | paradigm click-card |
| 1 | Linear Algebra Crash Course | live matmul tables with worked dot products |
| 2 | Derivatives & The Chain Rule | **canvas function plotter** showing f and f' side by side |
| **Track 2: Classical ML** |
| 3 | Linear Regression & MSE | **canvas drag-fit-line** with residuals + live MSE |
| 4 | Logistic Regression & Cross-Entropy | **canvas 2D classifier** with probability heatmap + decision boundary |
| 5 | Gradient Descent | **canvas GD on parabola** — try lr ≥ 1 to see divergence |
| **Track 3: Neural networks** |
| 6 | Neuron & Activations | **canvas plotter** for activation + its derivative |
| 7 | Forward Pass | **canvas network diagram** — nodes, weighted edges, live values |
| 8 | Backprop By Hand | **canvas network diagram** with red backward gradient arrows |
| 9 | Optimizers | **canvas loss-landscape race** — SGD vs momentum vs Adam |
| 10 | Overfitting & Regularization | **canvas train/val curves** that respond to reg sliders |
| **Track 4: Architectures + tokenization** |
| 11 | Convolutional NN | grid-based filter / output heatmap |
| 12 | Attention Mechanism | live Q/K/V attention-weight heatmap |
| 13 | Transformer Block | **canvas block diagram** (attention + FFN + residuals), click any sub-block |
| 14 | Tokenization & BPE | live BPE tokenizer with color-coded tokens |
| **Track 5: Modern LLMs** |
| 15 | Embeddings & Semantic Search | cosine-similarity rankings table |
| 16 | Pretraining → SFT → RLHF / DPO | **canvas log-scale cost-bar chart** showing 1000× cost gap |
| 17 | Sampling Strategies | live distribution table with temperature/top-k/top-p |
| 18 | Quantization & Inference | VRAM calculator (model size × precision × KV cache) |
| 19 | RAG, Tool Use & Agents | pattern picker with good-for / bad-for tags |
| 20 | AI in Plain English | step-by-step chatbot flow, low-math recap |

## ML-content priorities

- **Math accuracy is non-negotiable.** Worked examples should be reproducible by hand. The backprop level (8) walks the full chain on a 4-parameter network with concrete numbers — that level of rigor sets the bar for any later additions.
- **Concrete frontier-model examples**: GPT-3 has 96 heads / 96 blocks / 12,288 dim. Llama-3 70B has 80 blocks / 8 KV heads (grouped-query). These numbers anchor the abstractions in real systems the user has heard of.
- **Practical recipes** alongside theory: typical optimizer hyperparameters (Adam β₁=0.9, β₂=0.999, η=3e-4), typical sampling settings (T=0.7, top-p=0.9 for chat), typical quantization (Q4_K_M for 7B on consumer GPUs).
- **The hard puzzles often require combining ideas across levels** (chain rule + sigmoid derivative for L8.2; longest-prefix-style logic for L17.2 sampling-with-reproducibility, etc.). Don't make them just easier puzzles with bigger numbers.

## Sanity-check verifications

Done before shipping; if you significantly edit math content, redo:

```bash
cd trainers/ai-trainer
# Library smoke test
node -e "global.window=global; eval(require('fs').readFileSync('js/lib/mat.js','utf8'));
  var m = global.AIT.lib.mat;
  console.log('matmul', m.matmul([[1,2,3],[4,5,6]], [[7,8],[9,10],[11,12]]));
  console.log('softmax', m.softmax([1,1,1]));
  console.log('cosine', m.cosine([1,2,3],[1,2,3]));"
# Spot-check answer keys (see ../CLAUDE.md "Verification before shipping" for the full pattern)
```

The 56 spot-checked puzzle answer keys passed before shipping. Level 18's KV-cache calculation (10.7 GB for 70B / 32K / 8 KV heads) is the most arithmetically dense — re-verify if you touch it.
