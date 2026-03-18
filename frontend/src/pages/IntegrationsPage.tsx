import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { listDriveFiles } from "@/lib/api";

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export default function IntegrationsPage() {
  const [user, setUser] = useState<any>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionDbId, setNotionDbId] = useState("");
  const [notionToken, setNotionToken] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  // 드라이브 파일 목록
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [driveLoading, setDriveLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadIntegrations(data.session.user.id);
      setLoading(false);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) loadIntegrations(session.user.id);
    });

    // localStorage에서 노션 설정 복원
    const stored = localStorage.getItem("notion-integration");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setNotionToken(parsed.token ?? "");
        setNotionDbId(parsed.database_id ?? "");
        if (parsed.token && parsed.database_id) setNotionConnected(true);
      } catch { /* ignore */ }
    }

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadIntegrations = async (userId: string) => {
    const { data } = await supabase
      .from("integrations")
      .select("provider, extra")
      .eq("user_id", userId);
    if (data) {
      setGoogleConnected(data.some((d) => d.provider === "google_drive"));
    }
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        scopes: "https://www.googleapis.com/auth/drive.readonly",
        redirectTo: window.location.origin + window.location.pathname,
      },
    });
    if (error) showToast("구글 로그인에 실패했어요: " + error.message);
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

  const saveNotionConfig = () => {
    if (!notionToken.trim() || !notionDbId.trim()) {
      showToast("토큰과 데이터베이스 ID를 모두 넣어주세요");
      return;
    }
    localStorage.setItem(
      "notion-integration",
      JSON.stringify({ token: notionToken.trim(), database_id: notionDbId.trim() })
    );
    setNotionConnected(true);
    showToast("노션 설정을 저장했어요");
  };

  const disconnectNotion = () => {
    localStorage.removeItem("notion-integration");
    setNotionConnected(false);
    setNotionToken("");
    setNotionDbId("");
    showToast("노션 연결을 해제했어요");
  };

  const disconnectGoogle = async () => {
    if (user) {
      await supabase.from("integrations").delete().eq("user_id", user.id).eq("provider", "google_drive");
    }
    setGoogleConnected(false);
    setDriveFiles([]);
    await supabase.auth.signOut();
    setUser(null);
    showToast("구글 드라이브 연결을 해제했어요");
  };

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

      {/* 계정 */}
      {user && (
        <div className="card card-padded">
          <p className="text-label" style={{ marginBottom: 8 }}>계정</p>
          <p className="text-body">{user.email}</p>
        </div>
      )}

      {/* ─── 구글 드라이브 ─── */}
      <div className="card card-padded">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="text-section">구글 드라이브</h2>
            <p className="text-caption" style={{ marginTop: 2 }}>
              드라이브에서 트랜스크립트 파일을 가져올 수 있어요
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: user ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            {user ? "연결됨" : "미연결"}
          </span>
        </div>

        {!user ? (
          <button onClick={signInWithGoogle} className="btn-primary" style={{ width: "100%" }}>
            구글 계정으로 연결하기
          </button>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <button
              onClick={loadDriveFiles}
              disabled={driveLoading}
              className="btn-primary"
              style={{ width: "100%" }}
            >
              {driveLoading ? "불러오는 중..." : "드라이브 파일 보기"}
            </button>

            {/* 파일 목록 */}
            {driveFiles.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 8 }}>
                <p className="text-label" style={{ marginBottom: 4 }}>
                  {driveFiles.length}개 파일을 찾았어요
                </p>
                {driveFiles.map((file) => (
                  <div
                    key={file.id}
                    className="inner-card"
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 16px",
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        className="text-body"
                        style={{
                          fontWeight: 600,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {file.name}
                      </p>
                      <p className="text-caption" style={{ fontSize: 11 }}>
                        {new Date(file.modifiedTime).toLocaleDateString("ko-KR")}
                      </p>
                    </div>
                    <button
                      className="btn-primary"
                      style={{ fontSize: 12, padding: "6px 12px", flexShrink: 0 }}
                      onClick={() => {
                        showToast(`${file.name} 가져오기는 설정 페이지에서 평가를 실행해주세요`);
                      }}
                    >
                      가져오기
                    </button>
                  </div>
                ))}
              </div>
            )}

            <button
              onClick={disconnectGoogle}
              className="btn-secondary"
              style={{ width: "100%" }}
            >
              연결 해제
            </button>
          </div>
        )}
      </div>

      {/* ─── 노션 ─── */}
      <div className="card card-padded">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="text-section">노션</h2>
            <p className="text-caption" style={{ marginTop: 2 }}>
              평가 결과를 노션 데이터베이스에 기록하고 링크로 확인할 수 있어요
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: notionConnected ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            {notionConnected ? "연결됨" : "미연결"}
          </span>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div>
            <label htmlFor="notion-token" className="text-caption" style={{ display: "block", marginBottom: 6 }}>
              Internal Integration 토큰
            </label>
            <input
              id="notion-token"
              type="password"
              value={notionToken}
              onChange={(e) => setNotionToken(e.target.value)}
              placeholder="secret_..."
              className="input-field"
            />
          </div>
          <div>
            <label htmlFor="notion-db" className="text-caption" style={{ display: "block", marginBottom: 6 }}>
              데이터베이스 ID
            </label>
            <input
              id="notion-db"
              type="text"
              value={notionDbId}
              onChange={(e) => setNotionDbId(e.target.value)}
              placeholder="32자리 ID"
              className="input-field"
            />
            <p className="text-caption" style={{ marginTop: 4, fontSize: 11 }}>
              노션 데이터베이스 URL에서 마지막 32자리가 ID예요
            </p>
          </div>
          <button onClick={saveNotionConfig} className="btn-primary" style={{ width: "100%" }}>
            {notionConnected ? "설정 업데이트" : "노션 연결하기"}
          </button>
          {notionConnected && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "12px 16px",
                  background: "var(--primary-light)",
                  borderRadius: "var(--radius-sm)",
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--primary)" }} />
                <span className="text-body" style={{ fontSize: 13 }}>
                  강의 상세 페이지에서 "노션에 저장하기" 버튼으로 내보낼 수 있어요
                </span>
              </div>
              <button
                onClick={disconnectNotion}
                className="btn-secondary"
                style={{ width: "100%" }}
              >
                연결 해제
              </button>
            </>
          )}
        </div>
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
