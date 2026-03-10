# AI Lecture Analysis Report Generator

NLP-based project for analyzing lecture STT scripts and generating instructor feedback reports.

## Repository Layout

- `src/preprocessing`: STT cleaning, timestamp parsing, speaker separation
- `src/rule_analysis`: rule-based metrics and scoring
- `src/llm_analysis`: model client abstraction and qualitative analysis
- `src/report`: report data assembly and file export
- `app`: Streamlit UI
- `config`: settings and checklist definitions
- `data/sample`: versioned sample data only

## Quick Start

1. Create virtual environment.
2. Install dependencies: `pip install -r requirements.txt`
3. Copy `.env.example` to `.env` and fill API keys.
4. Run checks: `python scripts/check_env.py`
5. Run tests: `pytest`
6. Start app: `streamlit run app/main.py`

## Branch Strategy

- `main`: stable releases
- `develop`: integration branch
- `feature/a-preprocessing`
- `feature/b-rule-analysis`
- `feature/c-llm-analysis`
- `feature/d-report-ui`
