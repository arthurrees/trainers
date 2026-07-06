// glossary.js — Git Trainer glossary
window.GT = window.GT || {};

GT.glossary = {
  'blob': { name: 'blob', def: 'Git object type that stores raw file content. Named by the SHA-1 of its content.' },
  'tree': { name: 'tree', def: 'Git object that maps filenames and permissions to blob or sub-tree SHAs. Like a directory snapshot.' },
  'commit': { name: 'commit', def: 'Git object that records a tree snapshot, author, timestamp, message, and zero or more parent commit SHAs.' },
  'tag': { name: 'tag', def: 'A named pointer to a commit. Lightweight tags are just refs; annotated tags are full Git objects with their own SHA.' },
  'SHA': { name: 'SHA / object ID', def: 'The 40-hex-character content-based address of every Git object. Two identical byte sequences always produce the same SHA.' },
  'object store': { name: 'object store', def: 'The .git/objects/ directory. Every blob, tree, commit, and tag lives here, keyed by its SHA.' },
  'ref': { name: 'ref', def: 'A named pointer to a commit SHA. Stored as a small file under .git/refs/. Examples: branch names, tag names, HEAD.' },
  'HEAD': { name: 'HEAD', def: 'A special ref stored in .git/HEAD. Usually contains the name of the current branch ("ref: refs/heads/main"), but can point directly to a SHA (detached HEAD).' },
  'branch': { name: 'branch', def: 'A moveable ref that automatically advances when you commit. Just a 41-byte file with a SHA inside.' },
  'index': { name: 'index', def: 'Also called the staging area. A binary file (.git/index) that holds the next commit\'s tree snapshot. git add populates it.' },
  'working directory': { name: 'working directory', def: 'The actual files on disk in your project folder, which you edit directly.' },
  'staging area': { name: 'staging area', def: 'Synonym for index. What git add writes to. What git commit packages into a tree.' },
  'three trees': { name: 'three trees', def: 'Git\'s three separate snapshots of your project: the working directory, the index (staging), and HEAD.' },
  'merge': { name: 'merge', def: 'Combine two branches by creating a new commit with two parents (or fast-forwarding if no divergence).' },
  'fast-forward': { name: 'fast-forward', def: 'A merge where the current branch just moves its pointer to the other branch\'s tip — no merge commit needed because there is no divergence.' },
  '3-way merge': { name: '3-way merge', def: 'A merge using the two branch tips and their common ancestor to resolve differences. Always creates a merge commit.' },
  'rebase': { name: 'rebase', def: 'Replay commits from one branch onto a new base, creating new commit SHAs. Rewrites history.' },
  'cherry-pick': { name: 'cherry-pick', def: 'Copy a single commit\'s changes onto the current branch. The new commit gets a different SHA.' },
  'reflog': { name: 'reflog', def: 'A local log of every place HEAD and branch refs have pointed. The undo button for destructive operations.' },
  'detached HEAD': { name: 'detached HEAD', def: 'State where HEAD points directly to a commit SHA instead of a branch name. New commits are orphaned unless you create a branch.' },
  'remote': { name: 'remote', def: 'A named URL for another copy of the repository. Usually called "origin".' },
  'remote tracking ref': { name: 'remote tracking ref', def: 'A local read-only ref (e.g. origin/main) that records where a remote branch was the last time you fetched.' },
  'fetch': { name: 'fetch', def: 'Download objects and update remote tracking refs from a remote. Does not change your local branches.' },
  'pull': { name: 'pull', def: 'git fetch followed by git merge (or rebase) to integrate remote changes into the current branch.' },
  'push': { name: 'push', def: 'Upload local commits to a remote and advance its branch ref.' },
  'stash': { name: 'stash', def: 'A special commit that saves your working directory and index changes without making a regular commit.' },
  'gitignore': { name: '.gitignore', def: 'A file listing patterns. Git treats matching untracked files as ignored — it won\'t show them in status or add them with git add .' },
  'DAG': { name: 'DAG', def: 'Directed Acyclic Graph. Git\'s commit history is a DAG: arrows point from child to parent, and there are no cycles.' },
  'bisect': { name: 'git bisect', def: 'Binary-search the commit history to find which commit introduced a bug.' },
  'worktree': { name: 'worktree', def: 'An additional checked-out copy of a repository linked to the same .git directory. Lets you work on two branches simultaneously.' },
  'pack file': { name: 'pack file', def: 'A compressed file storing many Git objects together with delta compression.' },
  'orphan': { name: 'orphan commit', def: 'A commit with no path to any ref. Unreachable commits are eventually garbage-collected.' },
  'ORIG_HEAD': { name: 'ORIG_HEAD', def: 'Ref automatically set to the previous HEAD before a merge, rebase, or reset. Safety pointer for easy undo.' },
  'interactive rebase': { name: 'interactive rebase', def: 'git rebase -i lets you choose, for each replayed commit: pick, squash, fixup, reword, drop, or reorder.' }
};

GT.glossaryRender = function (terms, container) {
  container.innerHTML = '';
  if (!terms || !terms.length) {
    container.innerHTML = '<div class="muted">No new terms this level.</div>';
    return;
  }
  terms.forEach(function (key) {
    var entry = GT.glossary[key];
    if (!entry) return;
    var div = document.createElement('div');
    div.className = 'glossary-entry';
    div.innerHTML =
      '<div class="gsym">' + GT.escapeHtml(key) + '</div>' +
      '<div class="gdef"><span class="gname">' + GT.escapeHtml(entry.name) + '</span> — ' +
      GT.escapeHtml(entry.def) + '</div>';
    container.appendChild(div);
  });
};

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, function (c) {
    return ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c];
  });
}
GT.escapeHtml = escapeHtml;
