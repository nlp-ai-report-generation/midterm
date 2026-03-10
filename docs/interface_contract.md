# Interface Contract

All analyzers return the same output object shape.

```python
{
    "category": "language_quality",
    "item": "filler_word_repetition",
    "score": 3,
    "weight": "high",
    "evidence": ["now: 47", "so: 32"],
    "detail": "Average 2.3 filler words per minute detected.",
}
```

## Required Keys

- `category`: high-level checklist category
- `item`: unique item identifier
- `score`: integer 1-5
- `weight`: one of `high`, `medium`, `low`
- `evidence`: list of evidence strings
- `detail`: one-sentence explanation

## Rules

- Scores must be deterministic for rule-based modules.
- LLM modules must return parseable JSON before mapping to this schema.
- All modules must be pure functions where possible.
