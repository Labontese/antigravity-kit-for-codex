# Codex Kit

AI agent templates with agents, skills, and workflows for Codex-style development.

## Quick Start

Install into a project:

```bash
npx codex-kit init
```

Or install globally:

```bash
npm install -g codex-kit
codex-kit init
```

`init` installs:
- `.agent/` (agents, skills, workflows, scripts)
- `AGENTS.md` (Codex workspace contract)

## CLI Commands

| Command | Description |
| --- | --- |
| `codex-kit init` | Install `.agent` and `AGENTS.md` |
| `codex-kit update` | Refresh existing `.agent` and `AGENTS.md` |
| `codex-kit status` | Check installation status |

Common options:

```bash
codex-kit init --force
codex-kit init --path ./my-project
codex-kit init --branch main
codex-kit init --dry-run
codex-kit init --quiet
```

## How To Use In Codex CLI

1. Open your target project folder.
2. Run `codex-kit init`.
3. Start Codex in that same folder.
4. Ask naturally, or use workflow-style prompts.

Important:
- `/plan`, `/debug`, `/create`, etc. are prompt patterns in Codex chat.
- They are not terminal commands.

Examples you can paste into Codex chat:

```text
Use the /plan workflow to break down JWT auth with refresh tokens.
Use the /debug workflow to find why login returns HTTP 500.
Use frontend-specialist to refactor this page for performance.
$playwright open http://localhost:3000 and capture a screenshot.
```

## What You Get

- `agents`: specialist perspectives (frontend, backend, security, testing, ops, etc.)
- `skills`: reusable domain playbooks
- `workflows`: structured execution patterns (`/plan`, `/debug`, `/test`, `/orchestrate`, etc.)
- `scripts`: validation helpers under `.agent/scripts`

## Notes

If you use editor-integrated AI tooling (Cursor/Windsurf), avoid putting `.agent/` in project `.gitignore` if you want workflow discovery in the UI.
If you want to keep it untracked locally, prefer `.git/info/exclude`.

## Documentation

- Repo: `https://github.com/Labontese/antigravity-kit-for-codex`
- Web docs app: `web/`

## License

MIT
