# Codex Compatibility Map

This file maps Antigravity/Gemini concepts in this repository to Codex-native behavior.

## Concept Mapping

| Antigravity/Gemini Concept | Codex Equivalent |
| --- | --- |
| `GEMINI.md` always-on rule file | Root `AGENTS.md` workspace contract |
| Native "Agent Tool" language | Codex multi-agent orchestration and parallel tasking |
| Slash command workflows | Intent-based workflow selection (or literal slash command handling) |
| Mandatory `CODEBASE.md` checks | Optional discovery; use if present |
| Skill loading protocol | Progressive disclosure from `SKILL.md` + selected references/scripts |
| Simulated multi-agent requirement | Practical decomposition; no fixed minimum agent count |

## Operational Expectations in Codex

- Prefer direct execution and verification.
- Use only available files/tools in this environment.
- Keep references internally consistent (agents, skills, scripts).
- Report skipped checks with reasons.

## Known Transitional Areas

These still contain platform-specific language and should be migrated incrementally:

- `.agent/rules/GEMINI.md`
- `.agent/agents/*.md` (mentions of "Claude Code" in places)
- `.agent/workflows/*.md` (mode semantics tied to other runtimes)
- docs branding and examples under `README.md` and `web/`

## Migration Sequence

1. Phase 1: Contract layer (`AGENTS.md`) and compatibility map.
2. Phase 2: Reference integrity (agents/skills/scripts/files).
3. Phase 3: Runtime docs/web polish and platform-neutral wording.

