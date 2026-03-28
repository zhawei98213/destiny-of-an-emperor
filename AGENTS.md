# Repository Guidelines

## Project Structure & Module Organization
This repository is currently minimal. The tracked files are `README.md` and this guide, with no application source, test suite, or asset directories yet. As the project grows, keep code in a dedicated top-level directory such as `src/` or `game/`, place tests in `tests/`, and store static data or media in `assets/`. Mirror runtime modules in the test tree when possible, for example `src/battle/ai.py` with `tests/battle/test_ai.py`.

## Build, Test, and Development Commands
There are no build or test commands configured yet. Before adding automation, prefer simple, discoverable entry points and document them in `README.md`.

Examples for the current repository:

- `git status` checks local changes before starting work.
- `git log --oneline` reviews recent history and existing commit style.
- `rg --files` lists tracked project files quickly.

When tooling is added, expose it through stable commands such as `make test`, `pytest`, or `npm test` instead of ad hoc scripts.

## Coding Style & Naming Conventions
Use UTF-8 text files and keep Markdown concise and readable. For new code, use 4-space indentation unless the chosen language has a stronger standard. Prefer descriptive, lowercase directory and file names such as `assets/maps/` or `tests/test_intro.md`. Keep modules focused and avoid mixing game data, tooling, and runtime logic in the same file.

## Testing Guidelines
No test framework is configured yet. Add tests alongside any non-trivial feature or bug fix, and keep naming explicit: `test_<feature>.py`, `<feature>.spec.ts`, or similar patterns that match the selected stack. Favor fast, repeatable tests that can run locally before a pull request is opened.

## Commit & Pull Request Guidelines
The current history uses short, imperative commit messages such as `Initial commit`. Continue with that style: `Add map loader`, `Document save format`, `Fix battle state reset`. Keep each commit scoped to one logical change.

When working through a multi-step task, commit and push each completed step to GitHub instead of waiting until the very end.
处理多步骤任务时，每完成一个明确步骤，都要立即提交并推送到 GitHub，而不是等到全部结束后再统一提交。

Pull requests should include a brief description, note any setup or migration steps, and link related issues when available. If a change affects visuals, gameplay flow, or generated assets, include screenshots or sample output.

## Documentation Expectations
Update `README.md` and this file when you introduce new directories, commands, or contributor workflows. Repository documentation should describe the current state of the project, not planned structure that has not been committed yet.

Code comments, documentation, and `README.md` content should be written bilingually in English and Chinese whenever they are added or updated.
代码注释、项目文档以及 `README.md` 的新增或更新内容都应使用英文和中文双语编写。
