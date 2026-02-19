#!/usr/bin/env python3
"""
Skill: performance-profiling
Script: bundle_analyzer.py
Purpose: Inspect built asset sizes for basic bundle health checks.
Usage: python bundle_analyzer.py <project_path>
Output: JSON summary
"""

from __future__ import annotations

import json
import sys
from pathlib import Path
from typing import Dict, List, Tuple


BUILD_DIR_CANDIDATES = [
    ".next/static/chunks",
    "dist/assets",
    "build/static/js",
]


def collect_assets(root: Path) -> Tuple[Path | None, List[Path]]:
    for rel in BUILD_DIR_CANDIDATES:
        candidate = root / rel
        if candidate.exists() and candidate.is_dir():
            files = [p for p in candidate.rglob("*") if p.is_file() and p.suffix in {".js", ".mjs", ".css"}]
            return candidate, files
    return None, []


def summarize(files: List[Path]) -> Dict[str, object]:
    if not files:
        return {
            "total_files": 0,
            "total_kb": 0.0,
            "largest": [],
        }

    sized = sorted(((p, p.stat().st_size) for p in files), key=lambda x: x[1], reverse=True)
    total = sum(size for _, size in sized)
    largest = [
        {"file": str(path), "size_kb": round(size / 1024, 2)}
        for path, size in sized[:10]
    ]
    return {
        "total_files": len(files),
        "total_kb": round(total / 1024, 2),
        "largest": largest,
    }


def evaluate(summary: Dict[str, object]) -> Dict[str, object]:
    total_kb = float(summary.get("total_kb", 0.0))
    largest = summary.get("largest", [])
    largest_kb = float(largest[0]["size_kb"]) if largest else 0.0

    status = "[OK] bundle size looks healthy"
    findings: List[Dict[str, str]] = []

    if total_kb > 2048:
        status = "[!] large bundle size"
        findings.append(
            {
                "severity": "high",
                "type": "bundle-total",
                "message": f"Total analyzed assets are {round(total_kb/1024, 2)} MB.",
            }
        )
    if largest_kb > 800:
        status = "[!] oversized bundle chunk"
        findings.append(
            {
                "severity": "high",
                "type": "bundle-largest",
                "message": f"Largest file is {largest_kb} KB; consider code-splitting.",
            }
        )

    return {"status": status, "findings": findings}


def main() -> int:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "Usage: python bundle_analyzer.py <project_path>"}))
        return 1

    project_path = Path(sys.argv[1]).resolve()
    if not project_path.exists():
        print(json.dumps({"error": f"Project path does not exist: {project_path}"}))
        return 1

    build_dir, assets = collect_assets(project_path)
    if build_dir is None:
        print(
            json.dumps(
                {
                    "project": str(project_path),
                    "status": "[SKIP] no build artifacts found",
                    "searched": BUILD_DIR_CANDIDATES,
                    "hint": "Run a production build before bundle analysis.",
                },
                indent=2,
            )
        )
        return 0

    summary = summarize(assets)
    evaluation = evaluate(summary)

    result = {
        "project": str(project_path),
        "build_dir": str(build_dir),
        "summary": summary,
        "status": evaluation["status"],
        "findings": evaluation["findings"],
        "recommendations": [
            "Split large routes/components with dynamic imports.",
            "Avoid pulling entire utility libraries for small usage.",
            "Prefer server rendering for heavy client-only modules where possible.",
        ],
    }
    print(json.dumps(result, indent=2))

    has_high = any(item.get("severity") == "high" for item in result.get("findings", []))
    return 1 if has_high else 0


if __name__ == "__main__":
    raise SystemExit(main())
