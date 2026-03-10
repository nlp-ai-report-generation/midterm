"""Environment validation script for local development."""

from __future__ import annotations

import importlib.util
import platform
import shutil
import subprocess
import sys


def check_python() -> bool:
    v = sys.version_info
    ok = (v.major, v.minor) >= (3, 11)
    status = "OK" if ok else "FAIL (requires Python 3.11+)"
    print(f"[Python]  {v.major}.{v.minor}.{v.micro}  ...  {status}")
    return ok


def check_java() -> bool:
    java_path = shutil.which("java")
    if not java_path:
        print("[Java]    not found  ...  FAIL (install JDK 11+)")
        return False

    try:
        result = subprocess.run(
            ["java", "-version"],
            capture_output=True,
            text=True,
            check=False,
        )
        line = (result.stderr or result.stdout).splitlines()[0]
    except Exception:  # pragma: no cover - defensive fallback
        line = "installed"

    print(f"[Java]    {line}  ...  OK")
    return True


def check_venv() -> bool:
    in_venv = hasattr(sys, "real_prefix") or (
        hasattr(sys, "base_prefix") and sys.base_prefix != sys.prefix
    )
    status = "OK" if in_venv else "WARN (activate .venv recommended)"
    state = "active" if in_venv else "inactive"
    print(f"[venv]    {state}  ...  {status}")
    return in_venv


def check_packages() -> None:
    packages = {
        "dotenv": "python-dotenv",
        "yaml": "pyyaml",
        "konlpy": "konlpy",
        "pandas": "pandas",
        "langchain": "langchain",
        "streamlit": "streamlit",
        "docx": "python-docx",
    }

    print("\n[Package status]")
    for module, display_name in packages.items():
        status = "OK" if importlib.util.find_spec(module) else "Not installed"
        print(f"  {display_name:20s} ... {status}")


def main() -> int:
    print("=" * 60)
    print("  Environment Check")
    print("=" * 60)
    print(f"[OS]      {platform.system()} {platform.release()}")

    python_ok = check_python()
    java_ok = check_java()
    check_venv()
    check_packages()

    print("=" * 60)
    return 0 if (python_ok and java_ok) else 1


if __name__ == "__main__":
    raise SystemExit(main())
