import { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";
import { getAllEvaluations } from "@/lib/data";
import { listDriveFiles } from "@/lib/api";
import { formatDateShort } from "@/lib/utils";
import { supabase } from "@/lib/supabase";
import ScoreBadge from "@/components/shared/ScoreBadge";
import type { EvaluationResult } from "@/types/evaluation";

type SortKey = "latest" | "highest" | "lowest";

export default function LecturesPage() {
  const [evaluations, setEvaluations] = useState<EvaluationResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortKey>("latest");
  const [showList, setShowList] = useState(false);

  // 업로드/가져오기
  const [showImportMenu, setShowImportMenu] = useState(false);
  const [driveFiles, setDriveFiles] = useState<{ id: string; name: string; modifiedTime: string }[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);
  const [uploadDragOver, setUploadDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState("");

  useEffect(() => {
    getAllEvaluations()
      .then((data) => {
        setEvaluations(data.sort((a, b) => a.lecture_date.localeCompare(b.lecture_date)));
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const displayed = [...evaluations].sort((a, b) => {
    if (sortBy === "highest") return b.weighted_average - a.weighted_average;
    if (sortBy === "lowest") return a.weighted_average - b.weighted_average;
    return b.lecture_date.localeCompare(a.lecture_date);
  });

  const showToastMsg = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  const handleFileUpload = (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!file.name.endsWith(".txt")) {
      showToastMsg("텍스트(.txt) 파일만 업로드할 수 있어요");
      return;
    }
    showToastMsg(`${file.name}을 가져왔어요. 설정 페이지에서 평가를 실행해주세요`);
    setShowImportMenu(false);
  };

  const handleDriveImport = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.provider_token;

    if (!token) {
      // 구글 로그인 안 됨 → 바로 OAuth 시작
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          scopes: "https://www.googleapis.com/auth/drive.readonly",
          redirectTo: window.location.origin + window.location.pathname,
        },
      });
      if (error) showToastMsg("구글 로그인에 실패했어요");
      return;
    }

    // 이미 로그인 됨 → 파일 목록 가져오기
    setDriveLoading(true);
    try {
      const result = await listDriveFiles(token);
      if (result.files) {
        setDriveFiles(result.files);
        if (!result.files.length) showToastMsg("드라이브에 .txt 파일이 없어요");
      } else {
        showToastMsg("구글 드라이브 접근 권한을 확인해주세요. Google Cloud Console에서 테스트 사용자를 추가하거나 앱을 게시해야 해요");
      }
    } catch {
      showToastMsg("구글 드라이브에 연결할 수 없어요. 다시 로그인해주세요");
    } finally {
      setDriveLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!showList) {
    return (
      <div
        className="page-content"
        style={{
          minHeight: "calc(100vh - 120px)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "flex-start",
          gap: 24,
        }}
      >
        <h1
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: "var(--text-primary)",
            lineHeight: 1.4,
            letterSpacing: "-0.03em",
          }}
        >
          강의를 평가하고{"\n"}
          피드백을 확인해보세요
        </h1>
        <p className="text-body" style={{ fontSize: 16, lineHeight: 1.7, maxWidth: 400 }}>
          {evaluations.length}개 강의의 AI 평가 결과를 볼 수 있어요.{"\n"}
          점수, 강점, 개선할 점을 확인하고 다음 강의를 준비해보세요.
        </p>
        <button
          onClick={() => setShowList(true)}
          className="btn-primary"
          style={{ fontSize: 15, padding: "14px 28px", marginTop: 8 }}
        >
          강의 목록 보기
        </button>
      </div>
    );
  }

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div>
          <h1 className="text-title">강의 목록</h1>
          <p className="text-caption" style={{ marginTop: 2 }}>
            {evaluations.length}개 강의를 평가했어요
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {/* 가져오기 버튼 */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setShowImportMenu(!showImportMenu)}
              className="btn-primary"
              style={{ fontSize: 13, padding: "8px 16px" }}
            >
              + 강의 추가하기
            </button>

            {/* 드롭다운 메뉴 */}
            {showImportMenu && (
              <div
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 240,
                  background: "var(--surface)",
                  borderRadius: "var(--radius-inner)",
                  boxShadow: "var(--shadow-elevated)",
                  zIndex: 20,
                  overflow: "hidden",
                }}
              >
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px 20px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--grey-50)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ display: "block" }}>파일 직접 업로드</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    .txt 파일을 선택해요
                  </span>
                </button>
                <div style={{ height: 1, background: "var(--grey-100)" }} />
                <button
                  onClick={() => { setShowImportMenu(false); handleDriveImport(); }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px 20px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--grey-50)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ display: "block" }}>구글 드라이브에서 가져오기</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    드라이브의 텍스트 파일을 불러와요
                  </span>
                </button>
                <div style={{ height: 1, background: "var(--grey-100)" }} />
                <button
                  onClick={() => {
                    setShowImportMenu(false);
                    showToastMsg("노션에서 가져오기는 준비 중이에요");
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "14px 20px",
                    border: "none",
                    background: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "var(--text-primary)",
                    transition: "background 0.12s",
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "var(--grey-50)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <span style={{ display: "block" }}>노션에서 가져오기</span>
                  <span style={{ display: "block", fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                    노션 데이터베이스에서 강의 데이터를 불러와요
                  </span>
                </button>
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              style={{ display: "none" }}
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          {/* 정렬 탭 */}
          <div className="tab-bar" role="tablist">
            {(
              [
                { key: "latest", label: "최신순" },
                { key: "highest", label: "높은 점수" },
                { key: "lowest", label: "낮은 점수" },
              ] as const
            ).map((item) => (
              <button
                key={item.key}
                role="tab"
                aria-selected={sortBy === item.key}
                onClick={() => setSortBy(item.key)}
                className={`tab-item ${sortBy === item.key ? "active" : ""}`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 메뉴 바깥 클릭 시 닫기 */}
      {showImportMenu && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 19 }}
          onClick={() => setShowImportMenu(false)}
        />
      )}

      {/* 드라이브 파일 목록 */}
      {driveLoading && (
        <div className="card card-padded" style={{ textAlign: "center" }}>
          <p className="text-body">드라이브 파일을 불러오고 있어요...</p>
        </div>
      )}

      {driveFiles.length > 0 && (
        <div className="card" style={{ overflow: "hidden" }}>
          <div style={{ padding: "14px 32px", background: "var(--grey-50)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span className="text-label">구글 드라이브 · {driveFiles.length}개 파일</span>
            <button
              onClick={() => setDriveFiles([])}
              style={{ border: "none", background: "none", cursor: "pointer", fontSize: 13, color: "var(--text-muted)" }}
            >
              닫기
            </button>
          </div>
          {driveFiles.map((file) => (
            <div
              key={file.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "14px 32px",
                borderBottom: "1px solid var(--grey-50)",
              }}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <p className="text-body" style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {file.name}
                </p>
                <p className="text-caption" style={{ fontSize: 11 }}>
                  {new Date(file.modifiedTime).toLocaleDateString("ko-KR")}
                </p>
              </div>
              <button
                className="btn-primary"
                style={{ fontSize: 12, padding: "6px 14px", flexShrink: 0 }}
                onClick={() => showToastMsg(`${file.name}을 가져왔어요. 설정 페이지에서 평가를 실행해주세요`)}
              >
                가져오기
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Lecture List */}
      {displayed.length === 0 ? (
        <div
          className="card card-padded"
          style={{
            textAlign: "center",
            padding: "80px 32px",
            cursor: "pointer",
            border: uploadDragOver ? "2px dashed var(--primary)" : "2px dashed var(--grey-200)",
            background: uploadDragOver ? "var(--primary-light)" : "var(--surface)",
            transition: "all 0.15s ease",
          }}
          onDragOver={(e) => { e.preventDefault(); setUploadDragOver(true); }}
          onDragLeave={() => setUploadDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setUploadDragOver(false); handleFileUpload(e.dataTransfer.files); }}
          onClick={() => fileInputRef.current?.click()}
        >
          <p className="text-section" style={{ marginBottom: 8 }}>아직 강의가 없어요</p>
          <p className="text-body">파일을 드래그하거나 클릭해서 업로드해보세요</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: "hidden" }}>
          <div className="lecture-list-header">
            <span className="text-label">날짜</span>
            <span className="text-label">과목</span>
            <span className="text-label lecture-list-instructor">강사</span>
            <span className="text-label" style={{ textAlign: "right" }}>점수</span>
          </div>
          {displayed.map((evaluation) => (
            <Link
              key={evaluation.lecture_date}
              to={`/lectures/${evaluation.lecture_date}`}
              className="lecture-list-row"
            >
              <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: 14, color: "var(--text-tertiary)", fontWeight: 500 }}>
                {formatDateShort(evaluation.lecture_date)}
              </span>
              <span style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", paddingRight: 12 }}>
                {evaluation.metadata.subjects?.[0] ?? "강의"}
              </span>
              <span className="text-body lecture-list-instructor" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {evaluation.metadata.instructor ?? "-"}
              </span>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <ScoreBadge score={evaluation.weighted_average} size="sm" />
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{ background: "var(--text-primary)", color: "var(--surface)" }}
        >
          {toast}
        </div>
      )}
    </div>
  );
}
