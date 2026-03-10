"""Quick environment checks for local development."""

from __future__ import annotations

import os
import platform
import shutil
import sys


def check_binary(name: str) -> bool:
    return shutil.which(name) is not None


def main() -> int:
    print(f"Python: {sys.version.split()[0]}")
    print(f"OS: {platform.system()} {platform.release()}")

    java_ok = check_binary("java")
    print(f"Java installed: {java_ok}")

    provider = os.getenv("LLM_PROVIDER", "openai")
    print(f"LLM provider: {provider}")

    if provider == "openai":
        print(f"OPENAI_API_KEY set: {bool(os.getenv('OPENAI_API_KEY'))}")
    elif provider == "anthropic":
        print(f"ANTHROPIC_API_KEY set: {bool(os.getenv('ANTHROPIC_API_KEY'))}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
