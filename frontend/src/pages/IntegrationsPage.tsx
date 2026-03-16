import { useState, useEffect, useCallback } from "react";

const API_BASE = "http://localhost:8000";

interface DriveFile {
  id: string;
  name: string;
  modifiedTime: string;
}

export default function IntegrationsPage() {
  const [googleToken, setGoogleToken] = useState<string>(
    () => localStorage.getItem("google_drive_token") || ""
  );
  const [notionToken, setNotionToken] = useState<string>(
    () => localStorage.getItem("notion_token") || ""
  );
  const [notionDatabaseId, setNotionDatabaseId] = useState<string>(
    () => localStorage.getItem("notion_database_id") || ""
  );

  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [loadingFiles, setLoadingFiles] = useState(false);
  const [exportingNotion, setExportingNotion] = useState(false);
  const [toast, setToast] = useState("");

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  // Google Drive: fetch files when connected
  const fetchDriveFiles = useCallback(async () => {
    if (!googleToken) return;
    setLoadingFiles(true);
    try {
      const resp = await fetch(
        `${API_BASE}/api/drive/files?token=${encodeURIComponent(googleToken)}`
      );
      const data = await resp.json();
      setDriveFiles(data.files || []);
    } catch {
      showToast("드라이브 파일 목록을 가져올 수 없습니다");
    } finally {
      setLoadingFiles(false);
    }
  }, [googleToken]);

  useEffect(() => {
    if (googleToken) fetchDriveFiles();
  }, [googleToken, fetchDriveFiles]);

  // Google Drive: initiate OAuth
  const connectGoogle = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/auth/google`);
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      showToast("구글 인증 요청에 실패했습니다");
    }
  };

  const disconnectGoogle = () => {
    localStorage.removeItem("google_drive_token");
    setGoogleToken("");
    setDriveFiles([]);
    setSelectedFiles(new Set());
    showToast("구글 드라이브 연결이 해제되었습니다");
  };

  // Notion: initiate OAuth
  const connectNotion = async () => {
    try {
      const resp = await fetch(`${API_BASE}/api/auth/notion`);
      const data = await resp.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      showToast("노션 인증 요청에 실패했습니다");
    }
  };

  const disconnectNotion = () => {
    localStorage.removeItem("notion_token");
    localStorage.removeItem("notion_database_id");
    setNotionToken("");
    setNotionDatabaseId("");
    showToast("노션 연결이 해제되었습니다");
  };

  const handleDatabaseIdChange = (value: string) => {
    setNotionDatabaseId(value);
    localStorage.setItem("notion_database_id", value);
  };

  // Toggle file selection
  const toggleFile = (fileId: string) => {
    setSelectedFiles((prev) => {
      const next = new Set(prev);
      if (next.has(fileId)) {
        next.delete(fileId);
      } else {
        next.add(fileId);
      }
      return next;
    });
  };

  // Import selected files from Google Drive
  const importSelectedFiles = async () => {
    if (selectedFiles.size === 0) {
      showToast("파일을 선택해주세요");
      return;
    }
    let imported = 0;
    for (const fileId of selectedFiles) {
      try {
        const resp = await fetch(
          `${API_BASE}/api/drive/download/${fileId}?token=${encodeURIComponent(googleToken)}`
        );
        const data = await resp.json();
        if (data.content) imported++;
      } catch {
        // skip failed files
      }
    }
    showToast(`${imported}개 파일을 가져왔습니다`);
  };

  // Export evaluation results to Notion
  const exportToNotion = async () => {
    if (!notionToken || !notionDatabaseId) {
      showToast("노션 토큰과 데이터베이스 ID를 설정해주세요");
      return;
    }
    setExportingNotion(true);
    try {
      const params = new URLSearchParams({
        token: notionToken,
        database_id: notionDatabaseId,
        lecture_date: new Date().toISOString().split("T")[0],
        score: "0",
        model: "gpt-4o-mini",
      });
      const resp = await fetch(`${API_BASE}/api/notion/create-page?${params}`, {
        method: "POST",
      });
      const data = await resp.json();
      if (data.id) {
        showToast("노션에 평가 결과를 내보냈습니다");
      } else {
        showToast("내보내기에 실패했습니다");
      }
    } catch {
      showToast("노션 내보내기 요청에 실패했습니다");
    } finally {
      setExportingNotion(false);
    }
  };

  // Handle OAuth callback tokens from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get("access_token");
    const notionAccessToken = params.get("access_token");

    // Check if returning from Google OAuth
    if (accessToken && window.location.pathname.includes("google")) {
      localStorage.setItem("google_drive_token", accessToken);
      setGoogleToken(accessToken);
      window.history.replaceState({}, "", "/integrations");
    }

    // Check if returning from Notion OAuth
    if (notionAccessToken && window.location.pathname.includes("notion")) {
      localStorage.setItem("notion_token", notionAccessToken);
      setNotionToken(notionAccessToken);
      window.history.replaceState({}, "", "/integrations");
    }
  }, []);

  const googleConnected = !!googleToken;
  const notionConnected = !!notionToken;

  return (
    <div style={{ padding: "32px 40px", maxWidth: 800 }}>
      <h2 className="text-title" style={{ marginBottom: 4 }}>
        연동 설정
      </h2>
      <p
        className="text-body"
        style={{ color: "var(--text-secondary)", marginBottom: 32 }}
      >
        외부 서비스와 연결하여 데이터를 가져오거나 결과를 내보냅니다
      </p>

      {/* Toast */}
      {toast && (
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--text-primary)",
            color: "var(--surface)",
            padding: "10px 24px",
            borderRadius: "var(--radius-sm)",
            fontSize: 14,
            fontWeight: 600,
            zIndex: 100,
          }}
        >
          {toast}
        </div>
      )}

      {/* Google Drive Card */}
      <div
        className="card card-padded"
        style={{ marginBottom: 24, padding: 28 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h3
              className="text-section"
              style={{ marginBottom: 4 }}
            >
              구글 드라이브
            </h3>
            <span
              className="text-caption"
              style={{
                color: googleConnected
                  ? "var(--success, #22c55e)"
                  : "var(--text-tertiary)",
              }}
            >
              {googleConnected ? "연결됨" : "미연결"}
            </span>
          </div>
          {googleConnected ? (
            <button className="btn-secondary" onClick={disconnectGoogle}>
              연결 해제
            </button>
          ) : (
            <button className="btn-primary" onClick={connectGoogle}>
              구글 드라이브 연결
            </button>
          )}
        </div>

        {googleConnected && (
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 12,
              }}
            >
              <span
                className="text-body"
                style={{ fontWeight: 600, color: "var(--text-secondary)" }}
              >
                .txt 파일 목록
              </span>
              <button
                className="btn-primary"
                onClick={importSelectedFiles}
                disabled={selectedFiles.size === 0}
                style={{
                  opacity: selectedFiles.size === 0 ? 0.5 : 1,
                }}
              >
                선택한 파일 가져오기
              </button>
            </div>

            {loadingFiles ? (
              <p
                className="text-caption"
                style={{ color: "var(--text-tertiary)", padding: "12px 0" }}
              >
                파일 목록을 불러오는 중...
              </p>
            ) : driveFiles.length === 0 ? (
              <p
                className="text-caption"
                style={{ color: "var(--text-tertiary)", padding: "12px 0" }}
              >
                .txt 파일이 없습니다
              </p>
            ) : (
              <ul
                style={{
                  listStyle: "none",
                  display: "flex",
                  flexDirection: "column",
                  gap: 6,
                }}
              >
                {driveFiles.map((file) => (
                  <li
                    key={file.id}
                    onClick={() => toggleFile(file.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 12,
                      padding: "10px 12px",
                      borderRadius: "var(--radius-sm)",
                      background: selectedFiles.has(file.id)
                        ? "var(--primary-light)"
                        : "var(--background)",
                      cursor: "pointer",
                      transition: "background 0.15s",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={selectedFiles.has(file.id)}
                      readOnly
                      style={{ accentColor: "var(--primary)" }}
                    />
                    <span className="text-body" style={{ flex: 1 }}>
                      {file.name}
                    </span>
                    <span
                      className="text-caption"
                      style={{ color: "var(--text-tertiary)" }}
                    >
                      {file.modifiedTime
                        ? new Date(file.modifiedTime).toLocaleDateString("ko-KR")
                        : ""}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      {/* Notion Card */}
      <div
        className="card card-padded"
        style={{ padding: 28 }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
          }}
        >
          <div>
            <h3
              className="text-section"
              style={{ marginBottom: 4 }}
            >
              노션
            </h3>
            <span
              className="text-caption"
              style={{
                color: notionConnected
                  ? "var(--success, #22c55e)"
                  : "var(--text-tertiary)",
              }}
            >
              {notionConnected ? "연결됨" : "미연결"}
            </span>
          </div>
          {notionConnected ? (
            <button className="btn-secondary" onClick={disconnectNotion}>
              연결 해제
            </button>
          ) : (
            <button className="btn-primary" onClick={connectNotion}>
              노션 연결
            </button>
          )}
        </div>

        {notionConnected && (
          <div>
            <div style={{ marginBottom: 16 }}>
              <label
                className="text-caption"
                style={{
                  display: "block",
                  marginBottom: 6,
                  color: "var(--text-secondary)",
                  fontWeight: 600,
                }}
              >
                데이터베이스 ID
              </label>
              <input
                className="input-field"
                type="text"
                value={notionDatabaseId}
                onChange={(e) => handleDatabaseIdChange(e.target.value)}
                placeholder="노션 데이터베이스 ID를 입력하세요"
                style={{ width: "100%" }}
              />
            </div>
            <button
              className="btn-primary"
              onClick={exportToNotion}
              disabled={exportingNotion || !notionDatabaseId}
              style={{
                opacity: exportingNotion || !notionDatabaseId ? 0.5 : 1,
              }}
            >
              {exportingNotion ? "내보내는 중..." : "평가 결과 내보내기"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
