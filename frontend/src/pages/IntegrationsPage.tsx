import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

export default function IntegrationsPage() {
  const [user, setUser] = useState<any>(null);
  const [googleConnected, setGoogleConnected] = useState(false);
  const [notionConnected, setNotionConnected] = useState(false);
  const [notionDbId, setNotionDbId] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

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

    return () => listener.subscription.unsubscribe();
  }, []);

  const loadIntegrations = async (userId: string) => {
    const { data } = await supabase
      .from("integrations")
      .select("provider, extra")
      .eq("user_id", userId);
    if (data) {
      setGoogleConnected(data.some((d) => d.provider === "google_drive"));
      const notion = data.find((d) => d.provider === "notion");
      setNotionConnected(!!notion);
      setNotionDbId(notion?.extra?.database_id ?? "");
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
    if (error) showToast("구글 로그인 실패: " + error.message);
  };

  const connectNotion = async () => {
    // Notion OAuth는 Supabase에서 직접 지원하지 않으므로
    // 별도 팝업으로 처리하거나 Notion API 토큰을 직접 입력
    showToast("노션은 Internal Integration 토큰을 직접 입력해주세요");
  };

  const saveNotionConfig = async () => {
    if (!user || !notionDbId.trim()) return;
    const { error } = await supabase.from("integrations").upsert({
      user_id: user.id,
      provider: "notion",
      extra: { database_id: notionDbId.trim() },
      connected_at: new Date().toISOString(),
    });
    if (error) {
      showToast("저장 실패: " + error.message);
    } else {
      setNotionConnected(true);
      showToast("노션 설정이 저장되었습니다");
    }
  };

  const disconnect = async (provider: string) => {
    if (!user) return;
    await supabase.from("integrations").delete().eq("user_id", user.id).eq("provider", provider);
    if (provider === "google_drive") {
      setGoogleConnected(false);
      await supabase.auth.signOut();
      setUser(null);
    } else {
      setNotionConnected(false);
      setNotionDbId("");
    }
    showToast("연결이 해제되었습니다");
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
          외부 서비스와 연결하여 데이터를 가져오거나 결과를 내보냅니다
        </p>
      </div>

      {/* 로그인 상태 */}
      {user && (
        <div className="card card-padded">
          <p className="text-label" style={{ marginBottom: 8 }}>계정</p>
          <p className="text-body">{user.email}</p>
        </div>
      )}

      {/* 구글 드라이브 */}
      <div className="card card-padded">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="text-section">구글 드라이브</h2>
            <p className="text-caption" style={{ marginTop: 2 }}>
              드라이브에서 트랜스크립트 파일을 가져옵니다
            </p>
          </div>
          <span
            style={{
              fontSize: 12,
              fontWeight: 600,
              color: googleConnected || user ? "var(--primary)" : "var(--text-muted)",
            }}
          >
            {googleConnected || user ? "연결됨" : "미연결"}
          </span>
        </div>

        {!user ? (
          <button onClick={signInWithGoogle} className="btn-primary" style={{ width: "100%" }}>
            구글 계정으로 연결
          </button>
        ) : (
          <button
            onClick={() => disconnect("google_drive")}
            className="btn-secondary"
            style={{ width: "100%" }}
          >
            연결 해제
          </button>
        )}
      </div>

      {/* 노션 */}
      <div className="card card-padded">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
          <div>
            <h2 className="text-section">노션</h2>
            <p className="text-caption" style={{ marginTop: 2 }}>
              평가 결과를 노션 데이터베이스에 기록합니다
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
            <label htmlFor="notion-db" className="text-caption" style={{ display: "block", marginBottom: 6 }}>
              데이터베이스 ID
            </label>
            <input
              id="notion-db"
              type="text"
              value={notionDbId}
              onChange={(e) => setNotionDbId(e.target.value)}
              placeholder="노션 데이터베이스 ID를 입력하세요"
              className="input-field"
            />
            <p className="text-caption" style={{ marginTop: 4, fontSize: 11 }}>
              노션 데이터베이스 URL에서 마지막 32자리가 ID입니다
            </p>
          </div>
          <button onClick={saveNotionConfig} className="btn-primary" style={{ width: "100%" }}>
            {notionConnected ? "설정 업데이트" : "노션 연결"}
          </button>
          {notionConnected && (
            <button
              onClick={() => disconnect("notion")}
              className="btn-secondary"
              style={{ width: "100%" }}
            >
              연결 해제
            </button>
          )}
        </div>
      </div>

      {/* 안내 */}
      <div className="inner-card">
        <p className="text-body" style={{ lineHeight: 1.8 }}>
          구글 드라이브 연동은 Supabase OAuth를 통해 처리됩니다.
          노션은 Internal Integration 토큰과 데이터베이스 ID를 입력하면 연결됩니다.
          연동 정보는 Supabase에 안전하게 저장됩니다.
        </p>
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
