"""Simple map-reduce style text chunking chain."""

from __future__ import annotations

from collections.abc import Callable


def chunk_text(text: str, chunk_size: int = 1200) -> list[str]:
    """Split text into fixed-size chunks."""
    if chunk_size <= 0:
        raise ValueError("chunk_size must be > 0")
    return [text[i : i + chunk_size] for i in range(0, len(text), chunk_size)] or [""]


def map_reduce(chunks: list[str], map_fn: Callable[[str], str], reduce_fn: Callable[[list[str]], str]) -> str:
    """Run map function per chunk and reduce mapped outputs."""
    mapped = [map_fn(chunk) for chunk in chunks]
    return reduce_fn(mapped)
