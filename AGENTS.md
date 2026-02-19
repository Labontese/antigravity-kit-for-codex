# Codex Workspace Contract

This file is the canonical behavior contract when this repository is used in Codex.

## Scope and Priority

1. Runtime/system-level Codex instructions take highest priority.
2. This `AGENTS.md` defines workspace-level behavior for Codex sessions.
3. Domain guidance in `.agent/agents/*`, `.agent/skills/*`, and `.agent/workflows/*` is applied when relevant.
4. If guidance conflicts, prefer:
   - safety and correctness
   - user instruction
   - smallest valid change

## Core Intent

Use this repository as a specialist prompt/knowledge kit with:

- `.agent/agents`: domain personas
- `.agent/skills`: modular domain knowledge
- `.agent/workflows`: task procedures
- `.agent/scripts`: validation orchestration

Do not simulate unsupported platform behavior. Use real Codex capabilities and actual tools in this environment.

## Session Bootstrap (Codex)

At session start for substantive tasks:

1. Read `.agent/ARCHITECTURE.md` for current inventory and structure.
2. Identify likely domain(s) from user request.
3. Load only needed agent/skill docs (progressive disclosure).
4. Prefer execution over meta discussion unless ambiguity blocks progress.

`CODEBASE.md` is optional. If present, use it. If absent, continue with direct codebase discovery.

## Progressive Skill Loading

When a skill is needed:

1. Read `SKILL.md` first.
2. Load only the sections/files needed for the user request.
3. Run referenced scripts only when useful and available.
4. Report script outcomes with pass/fail and key findings.

Avoid loading all files in a skill folder by default.

## Agent Routing Policy

Use the lightest viable routing:

- Single domain task -> use one specialist perspective.
- Multi-domain or architectural task -> orchestrate across relevant specialists.
- Unknown or vague request -> ask focused clarifying questions, then proceed.

Preferred domain mapping:

- UI/Web: `frontend-specialist`
- API/Backend: `backend-specialist`
- Data/Schema: `database-architect`
- Security: `security-auditor` (and `penetration-tester` for active testing)
- Testing: `test-engineer`
- Infra/Delivery: `devops-engineer`
- Performance: `performance-optimizer`
- Planning: `project-planner`
- Debugging: `debugger`
- Discovery: `explorer-agent`

## Codex Orchestration Model

When decomposition is needed:

1. Break task into independent subtasks.
2. Assign ownership by file/domain boundary.
3. Execute in parallel when safe.
4. Synthesize into a single coherent result.

Do not enforce hard minimum counts like "must use 3 agents." Use only what the task requires.

## Workflow Invocation Mapping

Slash workflow docs in `.agent/workflows/*.md` are treated as procedural templates.

Interpretation in Codex:

- `/plan` -> planning artifact and task breakdown
- `/create` -> scaffold/implement feature with checkpoints
- `/debug` -> hypothesis-driven diagnosis and fix
- `/test` -> generate/run tests and report results
- `/deploy` -> preflight + deployment procedure
- `/orchestrate` -> coordinated multi-domain execution

If user does not use slash commands, infer equivalent workflow from intent.

## Validation and Quality Gates

Use validation scripts when relevant:

- `python .agent/scripts/checklist.py .`
- `python .agent/scripts/checklist.py . --url <url>`
- `python .agent/scripts/verify_all.py . --url <url>`

Skill-level scripts are available under `.agent/skills/*/scripts`.
Treat missing optional tooling gracefully (report skip reason, do not fabricate success).

## File and Edit Discipline

- Make targeted, minimal edits.
- Keep naming and references consistent across agents/skills/workflows/services.
- Preserve working behavior unless user requests refactor/rewrite.
- Avoid destructive commands unless explicitly requested.

## Reporting Contract

When finishing work:

1. State what changed.
2. State what was verified.
3. State remaining risks or follow-up items.

When blocked:

1. State exact blocker.
2. Show attempted path.
3. Propose the next concrete action.

## Compatibility Notes

This repository also contains Gemini/Antigravity-oriented docs.
In Codex sessions, use this file as the authoritative workspace contract and treat platform-specific docs as reference material.

