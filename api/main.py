"""강의 분석 API 서버.

프론트엔드에서 OpenAI 기반 평가 파이프라인을 실행할 수 있도록 하는 FastAPI 서버.
"""

from __future__ import annotations

import base64
import json
import logging
import os
import sys
from pathlib import Path
from typing import Optional
from urllib.parse import urlencode

import httpx
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from dotenv import load_dotenv

# 프로젝트 루트를 path에 추가
PROJECT_ROOT = Path(__file__).parent.parent
sys.path.insert(0, str(PROJECT_ROOT))
load_dotenv(PROJECT_ROOT / ".env")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="AI 강의 분석 API",
    description="LangGraph 기반 강의 평가 파이프라인 API",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:3001", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

EXPERIMENTS_DIR = PROJECT_ROOT / "experiments"

# --- OAuth Configuration ---

GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", "http://localhost:8000/api/auth/google/callback")

NOTION_CLIENT_ID = os.getenv("NOTION_CLIENT_ID", "")
NOTION_CLIENT_SECRET = os.getenv("NOTION_CLIENT_SECRET", "")
NOTION_REDIRECT_URI = os.getenv("NOTION_REDIRECT_URI", "http://localhost:8000/api/auth/notion/callback")


# --- Request/Response Models ---


class SettingsRequest(BaseModel):
    api_key: str
    model: str = "gpt-4o-mini"
    temperature: float = Field(default=0.1, ge=0.0, le=1.0)


class EvaluateRequest(BaseModel):
    dates: list[str]
    model: str = "gpt-4o-mini"
    temperature: float = Field(default=0.1, ge=0.0, le=1.0)
    chunk_minutes: int = Field(default=30, ge=10, le=120)
    overlap_minutes: int = Field(default=5, ge=0, le=30)
    use_calibrator: bool = True
    api_key: str = ""


class HealthResponse(BaseModel):
    status: str
    api_key_configured: bool
    transcripts_available: int


class ExperimentListItem(BaseModel):
    experiment_id: str
    name: str
    total_lectures: int
    created_at: Optional[str] = None


# --- Endpoints ---


@app.get("/api/health", response_model=HealthResponse)
async def health_check():
    """헬스 체크 및 환경 상태 확인."""
    api_key = os.getenv("OPENAI_API_KEY", "")
    is_configured = bool(api_key and api_key.startswith("sk-"))

    scripts_dir = PROJECT_ROOT / "NLP 과제 1 - AI 강의 분석 리포트 생성기" / "강의 스크립트"
    transcript_count = len(list(scripts_dir.glob("*.txt"))) if scripts_dir.exists() else 0

    return HealthResponse(
        status="ok",
        api_key_configured=is_configured,
        transcripts_available=transcript_count,
    )


@app.post("/api/settings")
async def update_settings(req: SettingsRequest):
    """API 키 및 모델 설정 업데이트 (환경변수로 반영)."""
    if req.api_key:
        os.environ["OPENAI_API_KEY"] = req.api_key
    if req.model:
        os.environ["OPENAI_MODEL"] = req.model

    return {
        "status": "ok",
        "message": "설정이 업데이트되었습니다",
        "api_key_configured": bool(req.api_key and req.api_key.startswith("sk-")),
    }


@app.post("/api/validate-key")
async def validate_api_key(req: SettingsRequest):
    """OpenAI API 키 유효성 검증."""
    if not req.api_key or not req.api_key.startswith("sk-"):
        return {"valid": False, "message": "API 키 형식이 올바르지 않습니다 (sk-로 시작해야 합니다)"}

    try:
        from openai import OpenAI

        client = OpenAI(api_key=req.api_key)
        client.models.list()
        return {"valid": True, "message": "API 키가 유효합니다"}
    except Exception as e:
        return {"valid": False, "message": f"API 키 검증 실패: {str(e)}"}


@app.post("/api/evaluate")
async def evaluate_lectures(req: EvaluateRequest):
    """강의 평가 실행."""
    if req.api_key:
        os.environ["OPENAI_API_KEY"] = req.api_key

    api_key = os.getenv("OPENAI_API_KEY", "")
    if not api_key or not api_key.startswith("sk-"):
        raise HTTPException(
            status_code=400,
            detail="OpenAI API 키가 설정되지 않았습니다. /api/settings에서 설정하세요.",
        )

    try:
        from src.experiment.config import ExperimentConfig
        from src.experiment.runner import run_experiment

        transcript_names = [f"{date}_kdt-backendj-21th.txt" for date in req.dates]

        config = ExperimentConfig(
            name=f"web_{req.model}_t{req.temperature}",
            description="프론트엔드에서 실행된 평가",
            model=req.model,
            temperature=req.temperature,
            chunk_duration_minutes=req.chunk_minutes,
            chunk_overlap_minutes=req.overlap_minutes,
            use_calibrator=req.use_calibrator,
            target_transcripts=transcript_names if req.dates else [],
            num_passes=1,
        )

        result_dir = run_experiment(config)

        # 결과 로드
        summary_path = result_dir / "summary.json"
        if summary_path.exists():
            with open(summary_path, encoding="utf-8") as f:
                summary = json.load(f)
        else:
            summary = {"experiment_id": config.experiment_id}

        # 개별 결과 로드
        results = []
        results_dir = result_dir / "results"
        if results_dir.exists():
            for rfile in sorted(results_dir.glob("*.json")):
                with open(rfile, encoding="utf-8") as f:
                    results.append(json.load(f))

        return {
            "status": "completed",
            "experiment_id": config.experiment_id,
            "summary": summary,
            "results": results,
        }

    except Exception as e:
        logger.exception("Evaluation failed")
        raise HTTPException(status_code=500, detail=f"평가 실행 실패: {str(e)}")


@app.get("/api/experiments")
async def list_experiments():
    """실험 결과 목록 조회."""
    experiments = []

    if not EXPERIMENTS_DIR.exists():
        return {"experiments": []}

    for exp_dir in sorted(EXPERIMENTS_DIR.iterdir(), reverse=True):
        if not exp_dir.is_dir():
            continue

        config_path = exp_dir / "config.json"
        summary_path = exp_dir / "summary.json"

        item = {"experiment_id": exp_dir.name}

        if config_path.exists():
            with open(config_path, encoding="utf-8") as f:
                config_data = json.load(f)
            item["name"] = config_data.get("name", "")
            item["model"] = config_data.get("model", "")
            item["created_at"] = config_data.get("created_at", "")

        if summary_path.exists():
            with open(summary_path, encoding="utf-8") as f:
                summary_data = json.load(f)
            item["total_lectures"] = summary_data.get("total_lectures", 0)
            item["average_scores"] = summary_data.get("average_scores", {})

        experiments.append(item)

    return {"experiments": experiments}


@app.get("/api/experiments/{experiment_id}")
async def get_experiment(experiment_id: str):
    """실험 상세 결과 조회."""
    exp_dir = EXPERIMENTS_DIR / experiment_id
    if not exp_dir.exists():
        raise HTTPException(status_code=404, detail="실험을 찾을 수 없습니다")

    result = {"experiment_id": experiment_id}

    config_path = exp_dir / "config.json"
    if config_path.exists():
        with open(config_path, encoding="utf-8") as f:
            result["config"] = json.load(f)

    summary_path = exp_dir / "summary.json"
    if summary_path.exists():
        with open(summary_path, encoding="utf-8") as f:
            result["summary"] = json.load(f)

    results_dir = exp_dir / "results"
    if results_dir.exists():
        result["results"] = []
        for rfile in sorted(results_dir.glob("*.json")):
            with open(rfile, encoding="utf-8") as f:
                result["results"].append(json.load(f))

    return result


# --- Google Drive OAuth ---


@app.get("/api/auth/google")
async def google_auth():
    """Redirect to Google OAuth consent screen."""
    params = {
        "client_id": GOOGLE_CLIENT_ID,
        "redirect_uri": GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": "https://www.googleapis.com/auth/drive.readonly",
        "access_type": "offline",
        "prompt": "consent",
    }
    return {"url": f"https://accounts.google.com/o/oauth2/v2/auth?{urlencode(params)}"}


@app.get("/api/auth/google/callback")
async def google_callback(code: str):
    """Exchange code for token, store in session."""
    async with httpx.AsyncClient() as client:
        resp = await client.post("https://oauth2.googleapis.com/token", data={
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "code": code,
            "grant_type": "authorization_code",
            "redirect_uri": GOOGLE_REDIRECT_URI,
        })
        tokens = resp.json()
    # Return token to frontend (frontend stores in localStorage)
    # In production, use httpOnly cookies
    return {"access_token": tokens.get("access_token"), "refresh_token": tokens.get("refresh_token")}


@app.get("/api/drive/files")
async def list_drive_files(token: str):
    """List .txt files from Google Drive."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            "https://www.googleapis.com/drive/v3/files",
            headers={"Authorization": f"Bearer {token}"},
            params={"q": "mimeType='text/plain'", "fields": "files(id,name,modifiedTime)"},
        )
        return resp.json()


@app.get("/api/drive/download/{file_id}")
async def download_drive_file(file_id: str, token: str):
    """Download a file from Google Drive."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            f"https://www.googleapis.com/drive/v3/files/{file_id}",
            headers={"Authorization": f"Bearer {token}"},
            params={"alt": "media"},
        )
        return {"content": resp.text, "filename": file_id}


# --- Notion OAuth ---


@app.get("/api/auth/notion")
async def notion_auth():
    """Redirect to Notion OAuth consent screen."""
    params = {
        "client_id": NOTION_CLIENT_ID,
        "redirect_uri": NOTION_REDIRECT_URI,
        "response_type": "code",
        "owner": "user",
    }
    return {"url": f"https://api.notion.com/v1/oauth/authorize?{urlencode(params)}"}


@app.get("/api/auth/notion/callback")
async def notion_callback(code: str):
    """Exchange Notion auth code for access token."""
    auth = base64.b64encode(f"{NOTION_CLIENT_ID}:{NOTION_CLIENT_SECRET}".encode()).decode()
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.notion.com/v1/oauth/token",
            headers={"Authorization": f"Basic {auth}", "Content-Type": "application/json"},
            json={"grant_type": "authorization_code", "code": code, "redirect_uri": NOTION_REDIRECT_URI},
        )
        return resp.json()


@app.post("/api/notion/create-page")
async def create_notion_page(token: str, database_id: str, lecture_date: str, score: float, model: str):
    """Create a page in a Notion database with evaluation results."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://api.notion.com/v1/pages",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json",
                "Notion-Version": "2022-06-28",
            },
            json={
                "parent": {"database_id": database_id},
                "properties": {
                    "강의 날짜": {"date": {"start": lecture_date}},
                    "점수": {"number": score},
                    "모델": {"rich_text": [{"text": {"content": model}}]},
                },
            },
        )
        return resp.json()
