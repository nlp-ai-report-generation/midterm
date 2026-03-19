import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import {
  listDriveFiles,
  getNotionAuthUrl,
  notionCallback,
  listNotionDatabases,
} from "@/lib/api";

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

interface NotionDb {
  id: string;
  title: string;
  url: string;
}

export default function IntegrationsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // 구글 드라이브
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);

  // 노션
  const [notionToken, setNotionToken] = useState("");
  const [notionWorkspace, setNotionWorkspace] = useState("");
  const [notionDbs, setNotionDbs] = useState<NotionDb[]>([]);
  const [selectedDb, setSelectedDb] = useState<NotionDb | null>(null);
  const [notionLoading, setNotionLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      setLoading(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    // localStorage에서 노션 설정 복원
    const stored = localStorage.getItem("notion-integration");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotionToken(parsed.token ?? "");
        setNotionWorkspace(parsed.workspace ?? "");
        if (parsed.database) setSelectedDb(parsed.database);
      } catch { /* ignore */ }
    }

    // URL에서 Notion OAuth 콜백 코드 확인
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      handleNotionCallback(code);
      // URL에서 code 파라미터 제거
      window.history.replaceState({}, "", window.location.pathname);
    }

    return () => listener.subscription.unsubscribe();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ─── 구글 드라이브 ───

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/drive.readonly",
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) showToast("구글 로그인에 실패했어요");
  };

  const loadDriveFiles = async () => {
    const session = await supabase.auth.getSession();
    const token = session.data.session?.provider_token;
    if (!token) {
      showToast("구글 드라이브 토큰이 없어요. 다시 연결해주세요");
      return;
    }
    setDriveLoading(true);
    try {
      const result = await listDriveFiles(token);
      setDriveFiles(result.files ?? []);
      if (!result.files?.length) showToast("드라이브에 .txt 파일이 없어요");
    } catch {
      showToast("파일 목록을 가져오지 못했어요");
    } finally {
      setDriveLoading(false);
    }
  };

  // ─── 노션 OAuth ───

  const startNotionAuth = async () => {
    try {
      const { url } = await getNotionAuthUrl();
      // 현재 페이지 URL을 state로 전달 (콜백 후 돌아오기 위해)
      window.location.href = url;
    } catch {
      showToast("노션 인증 URL을 가져오지 못했어요");
    }
  };

  const handleNotionCallback = useCallback(async (code: string) => {
    setNotionLoading(true);
    try {
      const result = await notionCallback(code);
      if (result.access_token) {
        setNotionToken(result.access_token);
        setNotionWorkspace(result.workspace_name ?? "");

        // 접근 가능한 DB 목록 가져오기
        const dbResult = await listNotionDatabases(result.access_token);
        setNotionDbs(dbResult.databases ?? []);

        showToast(`${result.workspace_name ?? "노션"} 워크스페이스에 연결했어요`);
      } else {
        showToast("노션 연결에 실패했어요");
      }
    } catch {
      showToast("노션 인증 처리 중 오류가 발생했어요");
    } finally {
      setNotionLoading(false);
    }
  }, []);

  const selectDatabase = (db: NotionDb) => {
    setSelectedDb(db);
    localStorage.setItem(
      "notion-integration",
      JSON.stringify({
        token: notionToken,
        database_id: db.id,
        workspace: notionWorkspace,
        database: db,
      })
    );
    showToast(`"${db.title}" 데이터베이스를 선택했어요`);
  };

  const disconnectNotion = () => {
    localStorage.removeItem("notion-integration");
    setNotionToken("");
    setNotionWorkspace("");
    setNotionDbs([]);
    setSelectedDb(null);
    showToast("노션 연결을 해제했어요");
  };

  const isNotionConnected = !!notionToken && !!selectedDb;

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="page-content" style={{ maxWidth: 640 }}>
      <div>
        <h1 className="text-title">연동 설정</h1>
        <p className="text-caption" style={{ marginTop: 4 }}>
          외부 서비스와 연결해서 데이터를 가져오거나 결과를 내보낼 수 있어요
        </p>
      </div>

      {/* ─── 구글 드라이브 ─── */}
      <div className="card card-padded">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="text-section">구글 드라이브</h2>
            <p className="text-caption" style={{ marginTop: 2 }}>
              드라이브에서 트랜스크립트 파일을 가져올 수 있어요
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: user ? "var(--primary)" : "var(--text-muted)" }}>
            {user ? "연결됨" : "미연결"}
          </span>
        </div>

        {!user ? (
          <button onClick={signInWithGoogle} className="btn-primary" style={{ width: "100%" }}>
            구글 계정으로 연결하기
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button onClick={loadDriveFiles} disabled={driveLoading} className="btn-primary" style={{ width: "100%" }}>
              {driveLoading ? "불러오는 중..." : "드라이브 파일 보기"}
            </button>

            {driveFiles.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 4 }}>
                <p className="text-label">{driveFiles.length}개 파일</p>
                {driveFiles.map((file) => (
                  <div key={file.id} className="inner-card" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px" }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p className="text-body" style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {file.name}
                      </p>
                      <p className="text-caption" style={{ fontSize: 11 }}>
                        {new Date(file.modifiedTime).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <button className="btn-primary" style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}>
                      가져오기
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── 노션 ─── */}
      <div className="card card-padded">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="text-section">노션</h2>
            <p className="text-caption" style={{ marginTop: 2 }}>
              평가 결과를 노션에 저장하고 링크로 바로 확인할 수 있어요
            </p>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: isNotionConnected ? "var(--primary)" : "var(--text-muted)" }}>
            {isNotionConnected ? "연결됨" : "미연결"}
          </span>
        </div>

        {!notionToken ? (
          /* Step 1: 노션 연결 */
          <button
            onClick={startNotionAuth}
            disabled={notionLoading}
            className="btn-primary"
            style={{ width: "100%" }}
          >
            {notionLoading ? "연결 중..." : "노션 계정으로 연결하기"}
          </button>
        ) : !selectedDb ? (
          /* Step 2: 데이터베이스 선택 */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {notionWorkspace && (
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                <span className="text-body" style={{ fontWeight: 600 }}>{notionWorkspace}</span>
                <span className="text-caption">워크스페이스에 연결됐어요</span>
              </div>
            )}

            {notionDbs.length > 0 ? (
              <>
                <p className="text-label">어떤 데이터베이스에 저장할까요?</p>
                {notionDbs.map((db) => (
                  <button
                    key={db.id}
                    onClick={() => selectDatabase(db)}
                    className="inner-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "14px 16px",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                      transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.background = "var(--grey-100)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.background = "var(--grey-50)"; }}
                  >
                    <span className="text-body" style={{ fontWeight: 600 }}>{db.title}</span>
                    <span style={{ fontSize: 14, color: "var(--text-muted)" }}>&rarr;</span>
                  </button>
                ))}
              </>
            ) : (
              <div>
                <p className="text-body">접근 가능한 데이터베이스가 없어요</p>
                <p className="text-caption" style={{ marginTop: 4 }}>
                  노션에서 통합에 데이터베이스 접근 권한을 추가해주세요
                </p>
              </div>
            )}

            <button onClick={disconnectNotion} className="btn-secondary" style={{ width: "100%" }}>
              다시 연결하기
            </button>
          </div>
        ) : (
          /* Step 3: 연결 완료 */
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                padding: "16px 20px",
                background: "var(--primary-light)",
                borderRadius: "var(--radius-sm)",
                display: "flex",
                flexDirection: "column",
                gap: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                <span className="text-body" style={{ fontWeight: 600 }}>{selectedDb.title}</span>
              </div>
              <p className="text-caption" style={{ fontSize: 12 }}>
                강의 상세 페이지에서 "노션에 저장하기"를 누르면 이 데이터베이스에 기록돼요
              </p>
              {selectedDb.url && (
                <a
                  href={selectedDb.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", textDecoration: "none" }}
                >
                  노션에서 열기 &rarr;
                </a>
              )}
            </div>

            <button onClick={disconnectNotion} className="btn-secondary" style={{ width: "100%" }}>
              연결 해제
            </button>
          </div>
        )}
      </div>

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
