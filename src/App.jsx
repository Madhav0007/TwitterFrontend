import { useCallback, useEffect, useMemo, useRef, useState } from "react";

// const API = "http://localhost:8080";
const API = import.meta.env.VITE_API_URL || "http://localhost:8080";
const ACCESS_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_ID_KEY = "userId";
const USERNAME_KEY = "username";
const THEME_KEY = "twirl-theme";

const getToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);

const saveTokens = (data) => {
  localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
  localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
  localStorage.setItem(USER_ID_KEY, String(data.userId));
  localStorage.setItem(USERNAME_KEY, data.username);
};

const clearTokens = () => {
  [ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY, USER_ID_KEY, USERNAME_KEY].forEach((k) => localStorage.removeItem(k));
};

async function apiFetch(path, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  let response = await fetch(`${API}${path}`, { ...options, headers });

  if (response.status === 401) {
    const refreshRes = await fetch(`${API}/api/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: getRefreshToken() }),
    });

    if (refreshRes.ok) {
      const refreshed = await refreshRes.json();
      saveTokens(refreshed);
      response = await fetch(`${API}${path}`, {
        ...options,
        headers: {
          ...headers,
          Authorization: `Bearer ${refreshed.accessToken}`,
        },
      });
    } else {
      clearTokens();
      window.location.reload();
    }
  }

  return response;
}

const icons = {
  home: ({ active = false } = {}) => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
    </svg>
  ),
  search: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3.5-3.5" />
    </svg>
  ),
  plus: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  heart: ({ active = false } = {}) => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.67l-1-1.07a5.5 5.5 0 0 0-7.8 7.8l1 1.08L12 21.2l7.8-7.72 1-1.08a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
  comment: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a3 3 0 0 1-3 3H8l-5 4V6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3Z" />
    </svg>
  ),
  edit: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  ),
  trash: () => (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6M14 11v6" />
    </svg>
  ),
  sun: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.42 1.42M17.65 17.65l1.42 1.42M2 12h2M20 12h2M4.93 19.07l1.42-1.42M17.65 6.35l1.42-1.42" />
    </svg>
  ),
  moon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A8.5 8.5 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
    </svg>
  ),
  logout: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10 17l5-5-5-5" />
      <path d="M15 12H3" />
      <path d="M21 3v18" />
    </svg>
  ),
  x: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  refresh: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a9 9 0 0 0-15.5-6.36L3 8" />
      <path d="M3 3v5h5" />
      <path d="M3 12a9 9 0 0 0 15.5 6.36L21 16" />
      <path d="M16 21h5v-5" />
    </svg>
  ),
  profile: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21a8 8 0 0 0-16 0" />
      <circle cx="12" cy="8" r="4" />
    </svg>
  ),
  send: () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4Z" />
    </svg>
  ),
  warning: () => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
      <path d="M12 9v4M12 17h.01" />
    </svg>
  ),
};

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');

  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { height: 100%; }
  body { margin: 0; font-family: Inter, system-ui, -apple-system, BlinkMacSystemFont, sans-serif; }

  :root {
    --bg: #0a0c12;
    --bg-elev: rgba(15, 18, 28, 0.78);
    --surface: #121521;
    --surface-2: #171b29;
    --surface-3: #1d2233;
    --border: rgba(255,255,255,0.08);
    --border-strong: rgba(255,255,255,0.14);
    --text: #eef2ff;
    --muted: #98a2c1;
    --accent: #4f7cff;
    --accent-2: #7c5cff;
    --accent-soft: rgba(79,124,255,0.14);
    --danger: #ff6d8d;
    --danger-soft: rgba(255,109,141,0.12);
    --shadow: 0 26px 80px rgba(0,0,0,0.38);
    --dock: rgba(12, 14, 22, 0.72);
    --field: rgba(255,255,255,0.04);
  }

  [data-theme='light'] {
    --bg: #f4f7fb;
    --bg-elev: rgba(255,255,255,0.8);
    --surface: #ffffff;
    --surface-2: #f8faff;
    --surface-3: #eef3ff;
    --border: rgba(18,28,55,0.08);
    --border-strong: rgba(18,28,55,0.14);
    --text: #111827;
    --muted: #58657c;
    --accent: #2358ff;
    --accent-2: #6c57ff;
    --accent-soft: rgba(35,88,255,0.10);
    --danger: #d83f66;
    --danger-soft: rgba(216,63,102,0.08);
    --shadow: 0 22px 66px rgba(18,28,55,0.10);
    --dock: rgba(255,255,255,0.86);
    --field: rgba(18,28,55,0.03);
  }

  body {
    color: var(--text);
    background:
      radial-gradient(circle at top left, rgba(79,124,255,0.10), transparent 24%),
      radial-gradient(circle at top right, rgba(124,92,255,0.10), transparent 22%),
      var(--bg);
    transition: background 180ms ease, color 180ms ease;
    overflow-x: hidden;
  }

  body.modal-open { overflow: hidden; }

  ::selection { background: var(--accent-soft); }
  ::-webkit-scrollbar { width: 10px; height: 10px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: var(--border-strong); border-radius: 999px; border: 2px solid transparent; background-clip: padding-box; }

  .shell {
    min-height: 100%;
    display: grid;
    grid-template-columns: 260px minmax(0, 1fr) 300px;
    gap: 0;
  }

  .side {
    position: sticky;
    top: 0;
    height: 100vh;
    padding: 22px 16px 96px;
    border-right: 1px solid var(--border);
    background: color-mix(in srgb, var(--bg) 90%, transparent);
    backdrop-filter: blur(18px);
    display: flex;
    flex-direction: column;
    gap: 14px;
  }

  .side-right {
    border-right: 0;
    border-left: 1px solid var(--border);
  }

  .brand-row { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .brand {
    font-size: 30px;
    font-weight: 900;
    letter-spacing: -0.06em;
    line-height: 1;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  .icon-btn, .ghost-btn, .primary-btn, .danger-btn, .tab-btn, .nav-btn, .nav-btn-active, .dock-item, .mini-btn {
    border: 0;
    cursor: pointer;
    font: inherit;
    transition: transform 160ms ease, background 160ms ease, color 160ms ease, opacity 160ms ease, box-shadow 160ms ease;
  }

  .icon-btn {
    width: 42px;
    height: 42px;
    display: inline-grid;
    place-items: center;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--text);
    border: 1px solid var(--border);
  }

  .icon-btn:hover, .ghost-btn:hover, .primary-btn:hover, .danger-btn:hover, .nav-btn:hover, .nav-btn-active:hover, .dock-item:hover, .mini-btn:hover { transform: translateY(-1px); }

  .nav-stack { display: flex; flex-direction: column; gap: 8px; margin-top: 8px; }
  .nav-btn, .nav-btn-active {
    display: flex;
    align-items: center;
    gap: 12px;
    width: 100%;
    padding: 14px 16px;
    border-radius: 18px;
    background: transparent;
    color: var(--muted);
    text-align: left;
    font-weight: 700;
  }
  .nav-btn-active {
    background: linear-gradient(135deg, var(--accent-soft), rgba(124,92,255,0.08));
    border: 1px solid var(--border);
    color: var(--text);
    box-shadow: var(--shadow);
  }

  .profile-card {
    margin-top: auto;
    padding: 16px;
    border-radius: 22px;
    background: linear-gradient(180deg, var(--surface), var(--surface-2));
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }

  .profile-row { display: flex; align-items: center; gap: 12px; }
  .avatar {
    width: 44px; height: 44px; border-radius: 50%;
    display: grid; place-items: center;
    color: white;
    font-weight: 800;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    flex: 0 0 auto;
  }
  .avatar.sm { width: 36px; height: 36px; font-size: 13px; }
  .avatar.xs { width: 30px; height: 30px; font-size: 12px; }

  .profile-name { font-weight: 800; font-size: 14px; }
  .profile-meta { font-size: 12px; color: var(--muted); margin-top: 2px; }
  .profile-desc { margin-top: 10px; color: var(--muted); font-size: 13px; line-height: 1.55; }

  .profile-stats { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; margin-top: 14px; }
  .stat-card {
    border: 1px solid var(--border);
    background: var(--field);
    border-radius: 18px;
    padding: 12px;
  }
  .stat-value { font-size: 20px; font-weight: 900; letter-spacing: -0.04em; }
  .stat-label { font-size: 12px; color: var(--muted); margin-top: 4px; }

  .signout-btn {
    margin-top: 14px;
    width: 100%;
    justify-content: flex-start;
    color: var(--danger);
    background: var(--danger-soft);
    border-radius: 16px;
    padding: 12px 14px;
  }

  .main { min-width: 0; padding-bottom: 120px; }
  .center-wrap { max-width: 840px; margin: 0 auto; }

  .topbar {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 18px 20px;
    border-bottom: 1px solid var(--border);
    background: var(--bg-elev);
    backdrop-filter: blur(18px);
  }
  .title-wrap { min-width: 0; }
  .title { margin: 0; font-size: 24px; line-height: 1; letter-spacing: -0.05em; font-weight: 900; }
  .subtitle { margin-top: 6px; color: var(--muted); font-size: 13px; }

  .feed-list { padding: 14px 20px 0; display: flex; flex-direction: column; gap: 14px; }

  .post-card {
    position: relative;
    border: 1px solid var(--border);
    background: linear-gradient(180deg, var(--surface), var(--surface-2));
    border-radius: 24px;
    overflow: hidden;
    box-shadow: var(--shadow);
  }

  .double-like-overlay {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    pointer-events: none;
    z-index: 5;
  }

  .double-like-heart {
    font-size: 80px;
    line-height: 1;
    filter: drop-shadow(0 12px 28px rgba(0,0,0,0.35));
    animation: heartPop 520ms ease-out forwards;
    transform-origin: center;
  }

  @keyframes heartPop {
    0% { opacity: 0; transform: scale(0.45); }
    18% { opacity: 1; transform: scale(1.08); }
    42% { opacity: 1; transform: scale(0.98); }
    100% { opacity: 0; transform: scale(1.18); }
  }

  .post-inner { padding: 16px 16px 14px; }
  .post-head { display: flex; align-items: flex-start; gap: 12px; }
  .post-head-main { flex: 1; min-width: 0; }
  .post-name { margin: 0; font-size: 17px; font-weight: 900; letter-spacing: -0.04em; }
  .post-creator { margin-top: 4px; font-size: 13px; color: var(--muted); }
  .post-time { color: var(--muted); font-size: 12px; white-space: nowrap; }
  .post-text { margin-top: 12px; line-height: 1.65; font-size: 14px; color: var(--text); white-space: pre-wrap; }
  .post-image { width: 100%; display: block; max-height: 440px; object-fit: cover; border-top: 1px solid var(--border); border-bottom: 1px solid var(--border); }

  .actions-row { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-top: 14px; }
  .left-actions, .right-actions { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; }

  .action-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 12px;
    border-radius: 14px;
    border: 1px solid var(--border);
    background: var(--surface-3);
    color: var(--muted);
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 160ms ease;
    position: relative;
  }
  .action-pill.like.active { color: var(--danger); background: var(--danger-soft); border-color: rgba(255,109,141,0.25); }
  .action-pill.comment.active { color: var(--accent); background: var(--accent-soft); border-color: rgba(79,124,255,0.25); }
  .action-pill:hover { border-color: var(--border-strong); transform: translateY(-1px); }

  /* Comment count badge */
  .comment-badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--accent);
    color: white;
    font-size: 10px;
    font-weight: 800;
    line-height: 1;
    margin-left: 2px;
  }

  /* Follow / Edit / Delete inline buttons */
  .post-action-btn {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface-3);
    color: var(--muted);
    font-size: 12px;
    font-weight: 700;
    cursor: pointer;
    transition: all 160ms ease;
  }
  .post-action-btn:hover { border-color: var(--border-strong); color: var(--text); transform: translateY(-1px); }
  .post-action-btn.follow-active { background: var(--accent-soft); color: var(--accent); border-color: rgba(79,124,255,0.25); }
  .post-action-btn.danger { color: var(--danger); }
  .post-action-btn.danger:hover { background: var(--danger-soft); border-color: rgba(255,109,141,0.25); }

  .comments-wrap {
    padding: 14px 16px 16px;
    background: color-mix(in srgb, var(--surface-2) 90%, transparent);
    border-top: 1px solid var(--border);
  }
  .comment-create { display: flex; gap: 10px; align-items: flex-start; margin-bottom: 12px; }
  .comment-field { flex: 1; min-width: 0; display: flex; gap: 10px; }
  .comment-input {
    flex: 1;
    min-width: 0;
    border: 1px solid var(--border);
    background: var(--field);
    color: var(--text);
    border-radius: 14px;
    padding: 11px 14px;
    outline: none;
    font: inherit;
    transition: border-color 160ms ease;
  }
  .comment-input:focus { border-color: var(--accent); }
  .comment-list { display: flex; flex-direction: column; gap: 10px; }
  .comment-item { display: flex; gap: 10px; align-items: flex-start; padding: 12px 0 0; border-top: 1px solid var(--border); }
  .comment-bubble { flex: 1; min-width: 0; }
  .comment-meta { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .comment-user { font-size: 13px; font-weight: 800; }
  .comment-text { margin-top: 4px; font-size: 14px; line-height: 1.55; color: var(--text); white-space: pre-wrap; }
  .comment-tools { display: flex; align-items: center; gap: 6px; }

  .mini-btn {
    border: 1px solid var(--border);
    background: var(--surface-3);
    color: var(--muted);
    border-radius: 10px;
    padding: 6px 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 160ms ease;
  }
  .mini-btn:hover { color: var(--text); border-color: var(--border-strong); }
  .edit-row { margin-top: 8px; display: flex; gap: 8px; }

  .empty-state {
    margin: 18px 20px 0;
    padding: 34px 22px;
    border: 1px dashed var(--border-strong);
    border-radius: 24px;
    color: var(--muted);
    text-align: center;
    background: color-mix(in srgb, var(--surface) 88%, transparent);
  }
  .loader { display: grid; place-items: center; padding: 44px; }
  .spinner {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    border: 3px solid var(--border);
    border-top-color: var(--accent);
    animation: spin 0.8s linear infinite;
  }
  @keyframes spin { to { transform: rotate(360deg); } }

  /* Modal - scrollable */
  .modal-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.62);
    backdrop-filter: blur(10px);
    z-index: 90;
    display: flex;
    align-items: flex-start;
    justify-content: center;
    padding: 40px 20px 40px;
    overflow-y: auto;
  }
  .modal {
    width: min(640px, 100%);
    border: 1px solid var(--border);
    border-radius: 28px;
    background: linear-gradient(180deg, var(--surface), var(--surface-2));
    box-shadow: var(--shadow);
    overflow: hidden;
    flex-shrink: 0;
    margin: auto;
  }
  .modal-head { display: flex; align-items: center; justify-content: space-between; padding: 18px 20px; border-bottom: 1px solid var(--border); position: sticky; top: 0; background: var(--surface); z-index: 2; }
  .modal-title { font-size: 18px; font-weight: 900; letter-spacing: -0.04em; }
  .modal-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 14px; }
  .field-label { font-size: 12px; color: var(--muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 8px; }
  .input-shell {
    width: 100%;
    border: 1px solid var(--border);
    background: var(--field);
    color: var(--text);
    border-radius: 16px;
    padding: 13px 14px;
    outline: none;
    font: inherit;
    transition: border-color 160ms ease, background 160ms ease;
  }
  .input-shell:focus { border-color: var(--accent); background: color-mix(in srgb, var(--field) 70%, var(--accent-soft)); }
  .text-shell { min-height: 112px; resize: vertical; }
  .modal-actions { display: flex; justify-content: flex-end; gap: 10px; margin-top: 4px; }
  .primary-btn, .ghost-btn, .danger-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 14px;
    font-weight: 800;
    cursor: pointer;
    border: 0;
    font: inherit;
    transition: all 160ms ease;
  }
  .primary-btn { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; box-shadow: 0 12px 26px rgba(35, 88, 255, 0.22); }
  .ghost-btn { background: var(--surface-2); color: var(--text); border: 1px solid var(--border); }
  .danger-btn { background: var(--danger-soft); color: var(--danger); border: 1px solid transparent; }
  .primary-btn:hover, .ghost-btn:hover, .danger-btn:hover { transform: translateY(-1px); }

  /* Confirm delete dialog */
  .confirm-dialog {
    width: min(420px, 100%);
    border: 1px solid var(--border);
    border-radius: 24px;
    background: linear-gradient(180deg, var(--surface), var(--surface-2));
    box-shadow: var(--shadow);
    padding: 28px 24px 24px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    margin: auto;
  }
  .confirm-icon {
    width: 52px;
    height: 52px;
    border-radius: 18px;
    background: var(--danger-soft);
    color: var(--danger);
    display: grid;
    place-items: center;
  }
  .confirm-title { font-size: 18px; font-weight: 900; letter-spacing: -0.04em; }
  .confirm-desc { color: var(--muted); font-size: 14px; line-height: 1.6; }
  .confirm-actions { display: flex; gap: 10px; margin-top: 4px; }

  .login-screen {
    min-height: 100%;
    display: grid;
    place-items: center;
    padding: 24px;
    position: relative;
    overflow: hidden;
  }
  .login-screen::before,
  .login-screen::after {
    content: "";
    position: absolute;
    border-radius: 999px;
    filter: blur(20px);
    opacity: 0.3;
  }
  .login-screen::before { width: 280px; height: 280px; background: rgba(79,124,255,0.28); top: -90px; right: 8%; }
  .login-screen::after { width: 220px; height: 220px; background: rgba(124,92,255,0.22); bottom: -90px; left: 8%; }

  .login-card {
    width: min(460px, 100%);
    border-radius: 30px;
    border: 1px solid var(--border);
    background: linear-gradient(180deg, var(--surface), var(--surface-2));
    box-shadow: var(--shadow);
    padding: 30px;
    position: relative;
    z-index: 1;
  }
  .login-brand { font-size: 40px; font-weight: 900; letter-spacing: -0.08em; line-height: 1; background: linear-gradient(135deg, var(--accent), var(--accent-2)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
  .login-sub { color: var(--muted); margin-top: 8px; margin-bottom: 22px; }
  .login-grid { display: grid; gap: 14px; }
  .login-error { color: var(--danger); font-size: 13px; margin-top: 12px; text-align: center; }
  .login-tip { font-size: 12px; color: var(--muted); margin-top: 14px; text-align: center; }

  .bottom-dock {
    position: fixed;
    left: 50%;
    transform: translateX(-50%);
    bottom: 18px;
    z-index: 70;
    width: min(440px, calc(100vw - 18px));
    border: 1px solid var(--border);
    background: var(--dock);
    backdrop-filter: blur(18px);
    border-radius: 24px;
    box-shadow: var(--shadow);
    display: grid;
    grid-template-columns: 1fr 1.1fr 1fr;
    overflow: hidden;
  }
  .dock-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 12px 8px;
    color: var(--muted);
    background: transparent;
    border: 0;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.02em;
    cursor: pointer;
  }
  .dock-item.active { color: var(--text); background: linear-gradient(180deg, color-mix(in srgb, var(--accent-soft) 70%, transparent), transparent); }
  .dock-create { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: white; border-left: 1px solid var(--border); border-right: 1px solid var(--border); }

  .drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0,0,0,0.42);
    backdrop-filter: blur(8px);
    z-index: 85;
  }
  .profile-drawer {
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    width: min(360px, 92vw);
    background: linear-gradient(180deg, var(--surface), var(--surface-2));
    border-left: 1px solid var(--border);
    z-index: 86;
    box-shadow: var(--shadow);
    display: flex;
    flex-direction: column;
    padding: 18px;
    gap: 14px;
    overflow-y: auto;
  }
  .drawer-head { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
  .drawer-title { font-size: 18px; font-weight: 900; letter-spacing: -0.04em; }
  .drawer-section { border: 1px solid var(--border); background: var(--field); border-radius: 22px; padding: 16px; }
  .drawer-stat-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 12px; }
  .drawer-stat { border: 1px solid var(--border); background: var(--surface-3); border-radius: 16px; padding: 12px; }
  .drawer-stat-num { font-size: 22px; font-weight: 900; letter-spacing: -0.04em; }
  .drawer-stat-label { margin-top: 4px; color: var(--muted); font-size: 12px; }
  .drawer-note { color: var(--muted); font-size: 13px; line-height: 1.55; }
  .drawer-actions { display: grid; gap: 10px; }
  .drawer-row { display: flex; align-items: center; gap: 12px; }

  .people-card { display: grid; gap: 12px; margin-top: 12px; }
  .people-title { font-size: 15px; font-weight: 900; letter-spacing: -0.03em; }
  .people-sub { color: var(--muted); font-size: 12px; margin-top: 4px; }
  .person-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
    padding: 12px;
    border-radius: 18px;
    border: 1px solid var(--border);
    background: var(--field);
  }
  .person-left { display: flex; align-items: center; gap: 10px; min-width: 0; }
  .person-name { font-size: 14px; font-weight: 800; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .person-meta { font-size: 12px; color: var(--muted); }
  .tiny-btn {
    border: 1px solid var(--border);
    background: var(--surface-3);
    color: var(--text);
    padding: 8px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 800;
    white-space: nowrap;
    cursor: pointer;
    transition: all 160ms ease;
  }
  .tiny-btn.following { background: var(--accent-soft); color: var(--accent); border-color: rgba(79,124,255,0.25); }

  .hint { color: var(--muted); font-size: 12px; }
  .toast {
    position: fixed;
    top: 18px;
    right: 18px;
    z-index: 120;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
    border-radius: 16px;
    padding: 12px 14px;
    box-shadow: var(--shadow);
    font-size: 13px;
    font-weight: 600;
    animation: slideIn 220ms ease;
  }
  @keyframes slideIn {
    from { opacity: 0; transform: translateY(-8px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* File upload pill */
  .file-pill {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 14px;
    border: 1px solid var(--border);
    border-radius: 14px;
    background: var(--field);
  }
  .file-pill-icon {
    width: 32px; height: 32px; border-radius: 10px;
    background: var(--accent-soft);
    color: var(--accent);
    display: grid; place-items: center;
    font-size: 14px;
    flex-shrink: 0;
  }
  .file-pill-name { font-size: 13px; font-weight: 700; }
  .file-pill-type { font-size: 11px; color: var(--muted); margin-top: 2px; }

  @media (max-width: 1180px) {
    .shell { grid-template-columns: 88px minmax(0,1fr); }
    .side-right { display: none; }
    .side { width: 88px; padding-inline: 10px; }
    .brand, .nav-label, .profile-card { display: none; }
    .nav-btn, .nav-btn-active { justify-content: center; padding: 14px 0; }
    .nav-btn span, .nav-btn-active span { display: none; }
    .main { border-right: 0; }
  }

  @media (max-width: 860px) {
    .shell { grid-template-columns: 1fr; }
    .side { display: none; }
    .main { padding-bottom: 110px; }
    .center-wrap { max-width: 100%; }
    .feed-list { padding-inline: 12px; }
    .topbar { padding-inline: 14px; }
    .title { font-size: 22px; }
    .bottom-dock { width: calc(100vw - 12px); bottom: 6px; border-radius: 18px; }
    .profile-drawer { width: 100vw; max-width: 100vw; }
  }
`;

function useTheme() {
  const [theme, setTheme] = useState(() => localStorage.getItem(THEME_KEY) || "dark");

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  return [theme, setTheme];
}

function Toast({ message }) {
  if (!message) return null;
  return <div className="toast">{message}</div>;
}

// Lock/unlock body scroll when modals are open
function useBodyScrollLock(locked) {
  useEffect(() => {
    if (locked) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
    return () => document.body.classList.remove("modal-open");
  }, [locked]);
}

function LoginPage({ onLogin, theme, setTheme }) {
  const [mode, setMode] = useState("login"); // "login" | "register"
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    setLoading(true);
    setError("");

    try {
      if (mode === "register") {
        if (password !== confirmPassword) {
          throw new Error("Passwords do not match");
        }

        const res = await fetch(`${API}/api/auth/register`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });

        const data = await res.json();
        const auth = data.responseObject ?? data;

        if (!res.ok) {
          throw new Error(data?.responseMessage || "Registration failed");
        }

        saveTokens(auth);
        onLogin({ userId: auth.userId, username: auth.username });
        return;
      }

      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      const auth = data.responseObject ?? data;

      if (!res.ok) {
        throw new Error(data?.responseMessage || "Invalid credentials");
      }

      saveTokens(auth);
      onLogin({ userId: auth.userId, username: auth.username });
    } catch (e) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <style>{styles}</style>
      <div className="login-screen">
        <div className="login-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: 12 }}>
            <div>
              <div className="login-brand">twirl.</div>
              <div className="login-sub">
                {mode === "login" ? "Sign in to continue." : "Create your account."}
              </div>
            </div>

            <button
              className="icon-btn"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              title="Toggle theme"
            >
              {theme === "dark" ? icons.sun() : icons.moon()}
            </button>
          </div>

          <div className="login-grid">
            <div>
              <div className="field-label">Username</div>
              <input
                className="input-shell"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="madhav"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>

            <div>
              <div className="field-label">Password</div>
              <input
                className="input-shell"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>

            {mode === "register" && (
              <div>
                <div className="field-label">Confirm password</div>
                <input
                  className="input-shell"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  onKeyDown={(e) => e.key === "Enter" && submit()}
                />
              </div>
            )}

            <button
              className="primary-btn"
              onClick={submit}
              disabled={loading || !username || !password || (mode === "register" && !confirmPassword)}
              style={{ width: "100%", padding: "14px 16px" }}
            >
              {loading ? "Please wait..." : mode === "login" ? "Sign In" : "Register"}
            </button>

            <button
              className="ghost-btn"
              onClick={() => {
                setError("");
                setMode(mode === "login" ? "register" : "login");
                setConfirmPassword("");
              }}
              style={{ width: "100%" }}
            >
              {mode === "login" ? "New user? Register" : "Back to login"}
            </button>
          </div>

          {error && <div className="login-error">{error}</div>}
          <div className="login-tip">Register logs the user in immediately.</div>
        </div>
      </div>
    </>
  );
}


function ComposerModal({ mode = "create", post, onClose, onSave }) {
  const isEdit = mode === "edit";
  const [form, setForm] = useState({
    name: post?.name || "",
    description: post?.description || "",
    imageUrl: post?.imageUrl || "",
  });
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);

  useBodyScrollLock(true);

  const save = async () => {
    setLoading(true);
    try {
      const res = await apiFetch("/api/v1/posts", {
        method: isEdit ? "PUT" : "POST",
        body: JSON.stringify(isEdit ? { id: post.id, ...form } : form),
      });

      const data = await res.json();
      const savedPost = data.responseObject;

      if (!isEdit && savedPost?.id && files.length > 0) {
        const uploadForm = new FormData();
        files.forEach((file) => uploadForm.append("files", file));

        const uploadRes = await fetch(`${API}/api/v1/posts/${savedPost.id}/media`, {
          method: "POST",
          headers: { Authorization: `Bearer ${getToken()}` },
          body: uploadForm,
        });

        if (!uploadRes.ok) {
          const errorText = await uploadRes.text();
          throw new Error(errorText || "Media upload failed");
        }

        const uploadData = await uploadRes.json();
        savedPost.media = uploadData.responseObject || [];
      }

      onSave(savedPost, isEdit);
      onClose();
    } catch (error) {
      alert(error?.message || "Failed to save post");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-head">
          <div className="modal-title">{isEdit ? "Edit post" : "New post"}</div>
          <button className="icon-btn" onClick={onClose} title="Close">{icons.x()}</button>
        </div>
        <div className="modal-body">
          <div>
            <div className="field-label">Title</div>
            <input className="input-shell" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="A short title" />
          </div>
          <div>
            <div className="field-label">Description</div>
            <textarea className="input-shell text-shell" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Write something engaging…" />
          </div>
          <div>
            <div className="field-label">Image URL (optional)</div>
            <input className="input-shell" value={form.imageUrl} onChange={(e) => setForm((f) => ({ ...f, imageUrl: e.target.value }))} placeholder="https://..." />
          </div>

          {!isEdit && (
            <div>
              <div className="field-label">Photos / Videos</div>
              <input
                className="input-shell"
                type="file"
                accept="image/*,video/*"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files || []))}
                style={{ padding: "10px 14px", cursor: "pointer" }}
              />
              <div className="hint" style={{ marginTop: 8 }}>
                Select one or more photos or videos. They upload after the post is saved.
              </div>
              {files.length > 0 && (
                <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
                  {files.map((file) => (
                    <div key={file.name} className="file-pill">
                      <div className="file-pill-icon">📎</div>
                      <div style={{ minWidth: 0 }}>
                        <div className="file-pill-name" style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{file.name}</div>
                        <div className="file-pill-type">{file.type || "unknown type"}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="modal-actions">
            <button className="ghost-btn" onClick={onClose}>Cancel</button>
            <button className="primary-btn" onClick={save} disabled={loading || !form.name.trim()}>
              {loading ? "Saving…" : isEdit ? "Update post" : "Publish"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Confirm delete dialog
function ConfirmDeleteModal({ onConfirm, onCancel }) {
  useBodyScrollLock(true);
  return (
    <div className="modal-backdrop" onClick={(e) => e.target === e.currentTarget && onCancel()}>
      <div className="confirm-dialog">
        <div className="confirm-icon">{icons.warning()}</div>
        <div>
          <div className="confirm-title">Delete this post?</div>
          <div className="confirm-desc" style={{ marginTop: 6 }}>
            This action is permanent and cannot be undone. All likes and comments on this post will also be removed.
          </div>
        </div>
        <div className="confirm-actions">
          <button className="ghost-btn" onClick={onCancel} style={{ flex: 1 }}>Cancel</button>
          <button className="danger-btn" onClick={onConfirm} style={{ flex: 1 }}>Yes, delete it</button>
        </div>
      </div>
    </div>
  );
}

function CommentsSection({ postId, me, onChangeCount }) {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [input, setInput] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(`/api/v1/posts/${postId}/comments`);
      const data = await res.json();
      const list = data.responseObject || [];
      setComments(list);
      onChangeCount?.(list.length);
    } finally {
      setLoading(false);
    }
  }, [postId, onChangeCount]);

  useEffect(() => { load(); }, [load]);

  const addComment = async () => {
    if (!input.trim()) return;
    const res = await apiFetch(`/api/v1/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ content: input }),
    });
    const data = await res.json();
    const newComments = [data.responseObject, ...comments];
    setComments(newComments);
    onChangeCount?.(newComments.length);
    setInput("");
  };

  const saveEdit = async (commentId) => {
    const res = await apiFetch(`/api/v1/comments/${commentId}`, {
      method: "PUT",
      body: JSON.stringify({ content: editText }),
    });
    const data = await res.json();
    setComments((prev) => prev.map((c) => (c.id === commentId ? data.responseObject : c)));
    setEditId(null);
    setEditText("");
  };

  const removeComment = async (commentId) => {
    await apiFetch(`/api/v1/comments/${commentId}`, { method: "DELETE" });
    const next = comments.filter((c) => c.id !== commentId);
    setComments(next);
    onChangeCount?.(next.length);
  };

  if (loading) return <div className="loader" style={{ padding: 14 }}><div className="spinner" /></div>;

  return (
    <div className="comments-wrap">
      <div className="comment-create">
        <div className="avatar xs">{me?.[0]?.toUpperCase() || "M"}</div>
        <div className="comment-field">
          <input
            className="comment-input"
            value={input}
            placeholder="Write a comment…"
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addComment()}
          />
          <button className="primary-btn" onClick={addComment} style={{ padding: "10px 14px" }}>Post</button>
        </div>
      </div>

      <div className="comment-list">
        {comments.length === 0 ? (
          <div className="hint" style={{ paddingTop: 4 }}>No comments yet. Be the first!</div>
        ) : comments.map((c) => {
          const mine = c.username === me;
          return (
            <div className="comment-item" key={c.id}>
              <div className="avatar xs">{c.username?.[0]?.toUpperCase() || "U"}</div>
              <div className="comment-bubble">
                <div className="comment-meta">
                  <div className="comment-user">@{c.username}</div>
                  {mine && (
                    <div className="comment-tools">
                      <button className="mini-btn" onClick={() => { setEditId(c.id); setEditText(c.content); }} title="Edit">{icons.edit()}</button>
                      <button className="mini-btn" onClick={() => removeComment(c.id)} title="Delete" style={{ color: "var(--danger)" }}>{icons.trash()}</button>
                    </div>
                  )}
                </div>

                {editId === c.id ? (
                  <div className="edit-row">
                    <input className="comment-input" value={editText} onChange={(e) => setEditText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && saveEdit(c.id)} />
                    <button className="ghost-btn" style={{ whiteSpace: "nowrap" }} onClick={() => { setEditId(null); setEditText(""); }}>Cancel</button>
                    <button className="primary-btn" onClick={() => saveEdit(c.id)}>Save</button>
                  </div>
                ) : (
                  <div className="comment-text">{c.content}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PostCard({ post, myId, onDelete, onEdit, showToast, onSocialChange }) {
  const [liked, setLiked] = useState(!!post.likedByUser);
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.commentCount || 0);
  const [busyLike, setBusyLike] = useState(false);
  const [following, setFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [showBurst, setShowBurst] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const isMine = Number(post.creatorUserId) === Number(myId);
  const canFollow = !!post.creatorUserId && !isMine;

  useEffect(() => {
    let alive = true;
    const loadFollowStatus = async () => {
      if (!canFollow) return;
      try {
        const res = await apiFetch(`/api/v1/users/${post.creatorUserId}/follow/status`);
        const data = await res.json();
        if (alive) setFollowing(!!data.responseObject);
      } catch {
        if (alive) setFollowing(false);
      }
    };
    loadFollowStatus();
    return () => { alive = false; };
  }, [canFollow, post.creatorUserId]);

  const likePost = async () => {
    if (busyLike) return;
    setBusyLike(true);
    try {
      if (liked) {
        await apiFetch(`/api/v1/likes/posts/${post.id}`, { method: "DELETE" });
        setLiked(false);
        setLikeCount((c) => Math.max(0, c - 1));
      } else {
        await apiFetch(`/api/v1/likes/posts/${post.id}`, { method: "POST" });
        setLiked(true);
        setLikeCount((c) => c + 1);
      }
    } finally {
      setBusyLike(false);
    }
  };

  const handleDoubleLike = async () => {
    if (busyLike) return;
    setShowBurst(true);
    setTimeout(() => setShowBurst(false), 520);
    if (!liked) await likePost();
  };

  const toggleFollow = async () => {
    if (!canFollow || followLoading) return;
    setFollowLoading(true);
    try {
      await apiFetch(`/api/v1/users/${post.creatorUserId}/follow`, {
        method: following ? "DELETE" : "POST",
      });
      setFollowing((v) => !v);
      showToast?.(following ? "Unfollowed" : "Now following");
      onSocialChange?.();
    } finally {
      setFollowLoading(false);
    }
  };

  const handleDeleteConfirmed = () => {
    setConfirmDelete(false);
    onDelete(post.id);
  };

  return (
    <>
      <article className="post-card" onDoubleClick={handleDoubleLike}>
        {showBurst && (
          <div className="double-like-overlay">
            <span className="double-like-heart">❤️</span>
          </div>
        )}

        {/* Header */}
        <div className="post-inner">
          <div className="post-head">
            <div className="avatar sm">
              {(post.creatorName || post.name || "U")[0]?.toUpperCase()}
            </div>
            <div className="post-head-main">
              <h3 className="post-name">{post.name}</h3>
              <div className="post-creator">
                {post.creatorName ? `@${post.creatorName}` : "Unknown author"}
              </div>
            </div>
            <div className="post-time">
              {post.creationDate ? new Date(post.creationDate).toLocaleDateString() : ""}
            </div>
          </div>
          {post.description && <div className="post-text">{post.description}</div>}
        </div>

        {/* Media */}
        {post.media && post.media.length > 0 ? (
          <div>
            {post.media.map((m) =>
              m.mediaType?.startsWith("video/") ? (
                <video key={m.id} className="post-image" controls src={`${API}${m.mediaUrl}`} />
              ) : (
                <img key={m.id} className="post-image" src={`${API}${m.mediaUrl}`} alt="post media" onError={(e) => (e.currentTarget.style.display = "none")} />
              )
            )}
          </div>
        ) : post.imageUrl && /^https?:\/\//i.test(post.imageUrl) ? (
          <img className="post-image" src={post.imageUrl} alt="post attachment" />
        ) : null}

        {/* Actions */}
        <div className="post-inner">
          <div className="actions-row">
            <div className="left-actions">
              <button
                className={`action-pill like ${liked ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); likePost(); }}
                disabled={busyLike}
              >
                ❤️ {likeCount}
              </button>

              <button
                className={`action-pill comment ${showComments ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setShowComments((s) => !s); }}
              >
                💬
                {commentCount > 0 ? (
                  <span className="comment-badge">{commentCount}</span>
                ) : (
                  <span>Comments</span>
                )}
              </button>
            </div>

            <div className="right-actions">
              {canFollow && (
                <button
                  className={`post-action-btn ${following ? "follow-active" : ""}`}
                  onClick={toggleFollow}
                  disabled={followLoading}
                >
                  {following ? "✓ Following" : "+ Follow"}
                </button>
              )}
              {isMine && (
                <>
                  <button className="post-action-btn" onClick={() => onEdit(post)}>
                    {icons.edit()} Edit
                  </button>
                  <button className="post-action-btn danger" onClick={() => setConfirmDelete(true)}>
                    {icons.trash()} Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {showComments && (
          <CommentsSection
            postId={post.id}
            me={localStorage.getItem("username")}
            onChangeCount={setCommentCount}
          />
        )}
      </article>

      {confirmDelete && (
        <ConfirmDeleteModal
          onConfirm={handleDeleteConfirmed}
          onCancel={() => setConfirmDelete(false)}
        />
      )}
    </>
  );
}

function Feed({ myId, showToast, reloadToken, openCreateSignal, mode, setMode, onSocialChange }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [composerOpen, setComposerOpen] = useState(false);
  const [editingPost, setEditingPost] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [sortColumn, setSortColumn] = useState("creationDate");
  const [sortOrder, setSortOrder] = useState("desc");
  const searchTimer = useRef(null);

  const loadPosts = useCallback(async (pageNo = 0, targetMode = mode, query = searchText, col = sortColumn, order = sortOrder) => {
    setLoading(true);
    try {
      const endpoint = targetMode === "explore" ? "/api/v1/posts/page" : "/api/v1/feed";
      const payload = targetMode === "explore"
        ? { page: pageNo, size: 10, sort: { column: col, order }, searchKey: query?.trim() || null, isActive: null }
        : { page: pageNo, size: 10, sort: { column: "creationDate", order: "desc" } };

      const res = await apiFetch(endpoint, { method: "POST", body: JSON.stringify(payload) });
      const data = await res.json();
      const list = data.responseObject || data.content || [];
      setPosts(list);
      setTotal(data.totalRecords || data.totalElements || list.length || 0);
      setPage(pageNo);
    } finally {
      setLoading(false);
    }
  }, [mode, searchText, sortColumn, sortOrder]);

  useEffect(() => { loadPosts(0, mode, searchText, sortColumn, sortOrder); }, [loadPosts, mode, reloadToken]);

  useEffect(() => {
    if (mode !== "explore") return;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => loadPosts(0, "explore", searchText, sortColumn, sortOrder), 280);
    return () => clearTimeout(searchTimer.current);
  }, [searchText, sortColumn, sortOrder, mode, loadPosts]);

  // Only open composer when the signal increments (not on first mount / login)
  const prevCreateSignal = useRef(openCreateSignal);
  useEffect(() => {
    if (openCreateSignal > 0 && openCreateSignal !== prevCreateSignal.current) {
      setComposerOpen(true);
    }
    prevCreateSignal.current = openCreateSignal;
  }, [openCreateSignal]);

  const visiblePosts = useMemo(() => {
    if (mode !== "explore") return posts;
    const q = searchText.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter((post) => {
      const hay = [post.name, post.description, post.creatorName].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [mode, posts, searchText]);

  const handleDelete = async (id) => {
    await apiFetch(`/api/v1/posts/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
    setTotal((t) => Math.max(0, t - 1));
    showToast("Post deleted");
  };

  const handleSave = (post, isEdit) => {
    if (isEdit) {
      setPosts((prev) => prev.map((p) => (p.id === post.id ? post : p)));
      showToast("Post updated");
    } else {
      setPosts((prev) => [post, ...prev]);
      setTotal((t) => t + 1);
      showToast("Post created!");
    }
  };

  const runSearch = () => loadPosts(0, "explore", searchText, sortColumn, sortOrder);

  return (
    <div className="center-wrap">
      <div className="topbar">
        <div className="title-wrap">
          <h1 className="title">{mode === "explore" ? "Explore" : "Home"}</h1>
          <div className="subtitle">{mode === "explore" ? "Search, sort, and discover posts" : "Personalized feed from the people you follow"}</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            display: "flex",
            border: "1px solid var(--border)",
            borderRadius: 14,
            overflow: "hidden",
            background: "var(--surface-2)",
          }}>
            <button
              onClick={() => setMode("feed")}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                borderRadius: 13,
                margin: 3,
                transition: "all 160ms ease",
                background: mode === "feed" ? "var(--accent-soft)" : "transparent",
                color: mode === "feed" ? "var(--accent)" : "var(--muted)",
              }}
            >
              Feed
            </button>
            <button
              onClick={() => setMode("explore")}
              style={{
                padding: "8px 16px",
                fontSize: 13,
                fontWeight: 700,
                border: 0,
                cursor: "pointer",
                fontFamily: "inherit",
                borderRadius: 13,
                margin: 3,
                transition: "all 160ms ease",
                background: mode === "explore" ? "var(--accent-soft)" : "transparent",
                color: mode === "explore" ? "var(--accent)" : "var(--muted)",
              }}
            >
              Explore
            </button>
          </div>
          <button className="icon-btn" onClick={() => loadPosts(page, mode, searchText, sortColumn, sortOrder)} title="Refresh">
            {icons.refresh()}
          </button>
        </div>
      </div>

      {mode === "explore" && (
        <div style={{ padding: "14px 20px 0" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: 10, alignItems: "center" }}>
            <input
              className="input-shell"
              value={searchText}
              placeholder="Search posts…"
              onChange={(e) => setSearchText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runSearch()}
            />
            <select className="input-shell" style={{ width: 140 }} value={sortColumn} onChange={(e) => setSortColumn(e.target.value)}>
              <option value="creationDate">Newest</option>
              <option value="name">Name</option>
            </select>
            <select className="input-shell" style={{ width: 110 }} value={sortOrder} onChange={(e) => setSortOrder(e.target.value)}>
              <option value="desc">Desc</option>
              <option value="asc">Asc</option>
            </select>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 10, gap: 10 }}>
            <div className="hint">Typing filters locally and queries the backend search API.</div>
            <button className="primary-btn" onClick={runSearch} style={{ padding: "8px 14px", fontSize: 13 }}>
              {icons.search()} Search
            </button>
          </div>
        </div>
      )}

      <div className="feed-list">
        {loading ? (
          <div className="loader"><div className="spinner" /></div>
        ) : visiblePosts.length === 0 ? (
          <div className="empty-state">
            {mode === "explore"
              ? "No matching posts found. Try a different keyword or sort option."
              : "No posts yet. Follow people or create your first post."}
          </div>
        ) : (
          visiblePosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              myId={myId}
              onDelete={handleDelete}
              onEdit={(p) => setEditingPost(p)}
              showToast={showToast}
              onSocialChange={onSocialChange}
            />
          ))
        )}
      </div>

      {total > 10 && (
        <div style={{ display: "flex", justifyContent: "center", gap: 12, padding: "18px 20px 8px" }}>
          <button className="ghost-btn" disabled={page <= 0} onClick={() => loadPosts(page - 1, mode, searchText, sortColumn, sortOrder)}>← Prev</button>
          <div className="hint" style={{ alignSelf: "center" }}>{page * 10 + 1}–{Math.min((page + 1) * 10, total)} of {total}</div>
          <button className="primary-btn" disabled={(page + 1) * 10 >= total} onClick={() => loadPosts(page + 1, mode, searchText, sortColumn, sortOrder)}>Next →</button>
        </div>
      )}

      {composerOpen && <ComposerModal mode="create" onClose={() => setComposerOpen(false)} onSave={handleSave} />}
      {editingPost && <ComposerModal mode="edit" post={editingPost} onClose={() => setEditingPost(null)} onSave={handleSave} />}
    </div>
  );
}

function SuggestedPersonCard({ person, onChanged }) {
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const res = await apiFetch(`/api/v1/users/${person.id}/follow/status`);
        const data = await res.json();
        if (alive) setFollowing(!!data.responseObject);
      } catch {
        if (alive) setFollowing(false);
      }
    })();
    return () => { alive = false; };
  }, [person.id]);

  const toggle = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await apiFetch(`/api/v1/users/${person.id}/follow`, { method: following ? "DELETE" : "POST" });
      setFollowing((v) => !v);
      onChanged?.();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="person-row">
      <div className="person-left">
        <div className="avatar xs">{(person.name || person.username || "U")[0]?.toUpperCase()}</div>
        <div style={{ minWidth: 0 }}>
          <div className="person-name">{person.name || person.username}</div>
          <div className="person-meta">@{person.username || person.name}</div>
        </div>
      </div>
      <button className={`tiny-btn ${following ? "following" : ""}`} onClick={toggle} disabled={loading}>
        {following ? "✓ Following" : "+ Follow"}
      </button>
    </div>
  );
}

function PeopleSuggestionsRail({ refreshKey, onChanged }) {
  const [people, setPeople] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await apiFetch("/api/v1/posts/page", {
          method: "POST",
          body: JSON.stringify({ page: 0, size: 20, sort: { column: "creationDate", order: "desc" }, searchKey: null, isActive: null }),
        });
        const data = await res.json();
        const posts = data.responseObject || data.content || [];
        const unique = [];
        const seen = new Set();
        const myId = Number(localStorage.getItem(USER_ID_KEY));
        posts.forEach((p) => {
          const id = p.creatorUserId;
          if (!id || Number(id) === myId || seen.has(id)) return;
          seen.add(id);
          unique.push({ id, name: p.creatorName, username: p.creatorName });
        });
        if (mounted) setPeople(unique);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [refreshKey]);

  return (
    <div className="people-card">
      <div style={{ padding: "4px 0 8px" }}>
        <div className="people-title">People to follow</div>
        <div className="people-sub">Discover creators and follow them.</div>
      </div>

      {loading ? (
        <div className="loader" style={{ padding: 18 }}><div className="spinner" /></div>
      ) : people.length === 0 ? (
        <div className="hint" style={{ textAlign: "center", padding: "18px 0" }}>
          No suggested people yet.
        </div>
      ) : (
        people.map((person) => <SuggestedPersonCard key={person.id} person={person} onChanged={onChanged} />)
      )}
    </div>
  );
}

function ProfileDrawer({ open, onClose, theme, setTheme, auth, onLogout, refreshKey }) {
  const [followers, setFollowers] = useState(0);
  const [following, setFollowing] = useState(0);
  const [loading, setLoading] = useState(true);

  useBodyScrollLock(open);

  useEffect(() => {
    if (!open || !auth?.userId) return;
    let mounted = true;
    setLoading(true);

    (async () => {
      try {
        const [followersRes, followingRes] = await Promise.all([
          apiFetch(`/api/v1/users/${auth.userId}/followers/count`),
          apiFetch(`/api/v1/users/${auth.userId}/following/count`),
        ]);
        const followersData = await followersRes.json();
        const followingData = await followingRes.json();
        if (!mounted) return;
        setFollowers(Number(followersData.responseObject || 0));
        setFollowing(Number(followingData.responseObject || 0));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [open, auth?.userId, refreshKey]);

  if (!open) return null;

  return (
    <>
      <div className="drawer-backdrop" onClick={onClose} />
      <aside className="profile-drawer" role="dialog" aria-modal="true">
        <div className="drawer-head">
          <div className="drawer-title">Profile</div>
          <button className="icon-btn" onClick={onClose} title="Close">{icons.x()}</button>
        </div>

        <div className="drawer-section">
          <div className="drawer-row">
            <div className="avatar">{auth.username?.[0]?.toUpperCase() || "U"}</div>
            <div>
              <div className="profile-name">{auth.username}</div>
              <div className="profile-meta">User ID #{auth.userId}</div>
            </div>
          </div>

          <div className="drawer-stat-grid">
            <div className="drawer-stat">
              <div className="drawer-stat-num">{loading ? "—" : followers}</div>
              <div className="drawer-stat-label">Followers</div>
            </div>
            <div className="drawer-stat">
              <div className="drawer-stat-num">{loading ? "—" : following}</div>
              <div className="drawer-stat-label">Following</div>
            </div>
          </div>

          <div className="drawer-note" style={{ marginTop: 10 }}>Counts refresh when you follow or unfollow people.</div>
        </div>

        <div className="drawer-section">
          <div className="drawer-row" style={{ justifyContent: "space-between" }}>
            <div>
              <div className="profile-name">Appearance</div>
              <div className="profile-meta">Toggle light or dark mode</div>
            </div>
            <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
              {theme === "dark" ? icons.sun() : icons.moon()}
            </button>
          </div>
        </div>

        <div className="drawer-actions">
          <button className="danger-btn" onClick={onLogout} style={{ justifyContent: "flex-start", width: "100%" }}>
            {icons.logout()} Sign Out
          </button>
        </div>
      </aside>
    </>
  );
}

function BottomDock({ onHome, onCreate, onProfile, profileOpen }) {
  return (
    <div className="bottom-dock">
      <button className={`dock-item ${!profileOpen ? "active" : ""}`} onClick={onHome}>
        {icons.home({ active: !profileOpen })}
        <span>Home</span>
      </button>
      <button className="dock-item dock-create" onClick={onCreate}>
        {icons.plus()}
        <span>Create</span>
      </button>
      <button className={`dock-item ${profileOpen ? "active" : ""}`} onClick={onProfile}>
        {icons.profile()}
        <span>Profile</span>
      </button>
    </div>
  );
}

export default function App() {
  const [theme, setTheme] = useTheme();
  const [auth, setAuth] = useState(() => {
    const token = getToken();
    return token ? { userId: Number(localStorage.getItem(USER_ID_KEY)), username: localStorage.getItem(USERNAME_KEY) } : null;
  });
  const [toast, setToast] = useState("");
  const toastTimer = useRef(null);
  const [reloadToken, setReloadToken] = useState(0);
  const [createSignal, setCreateSignal] = useState(0);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileRefresh, setProfileRefresh] = useState(0);
  const [mode, setMode] = useState("feed");

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(""), 2600);
  };

  const logout = () => {
    clearTokens();
    setAuth(null);
  };

  const refreshFeed = () => setReloadToken((v) => v + 1);
  const refreshProfile = () => setProfileRefresh((v) => v + 1);
  const openCreate = () => setCreateSignal((v) => v + 1);

  if (!auth) {
    return <LoginPage onLogin={(data) => setAuth(data)} theme={theme} setTheme={setTheme} />;
  }

  return (
    <>
      <style>{styles}</style>
      <div data-theme={theme} className="shell">

        {/* Left sidebar */}
        <aside className="side">
          <div className="brand-row">
            <div className="brand">twirl.</div>
            <button className="icon-btn" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} title="Toggle theme">
              {theme === "dark" ? icons.sun() : icons.moon()}
            </button>
          </div>

          <div className="nav-stack">
            <button
              className={`nav-btn${mode === "feed" ? "-active" : ""}`}
              onClick={() => { setMode("feed"); refreshFeed(); }}
            >
              <span>{icons.home({ active: mode === "feed" })}</span>
              <span className="nav-label">Home</span>
            </button>
            <button
              className={`nav-btn${mode === "explore" ? "-active" : ""}`}
              onClick={() => { setMode("explore"); refreshFeed(); }}
            >
              <span>{icons.search()}</span>
              <span className="nav-label">Explore</span>
            </button>
            <button className="nav-btn" onClick={openCreate}>
              <span>{icons.plus()}</span>
              <span className="nav-label">Create post</span>
            </button>
            <button className="nav-btn" onClick={() => setProfileOpen(true)}>
              <span>{icons.profile()}</span>
              <span className="nav-label">Profile</span>
            </button>
          </div>

          {/* Profile card in sidebar — only username, no duplicate description */}
          <div className="profile-card">
            <div className="profile-row">
              <div className="avatar">{auth.username?.[0]?.toUpperCase() || "U"}</div>
              <div style={{ minWidth: 0 }}>
                <div className="profile-name">{auth.username}</div>
                <div className="profile-meta">ID #{auth.userId}</div>
              </div>
            </div>
            <button
              className="danger-btn signout-btn"
              onClick={logout}
              style={{ width: "100%", marginTop: 14, justifyContent: "flex-start" }}
            >
              {icons.logout()}
              <span>Sign Out</span>
            </button>
          </div>
        </aside>

        {/* Main feed */}
        <main className="main">
          <Feed
            myId={auth.userId}
            showToast={showToast}
            reloadToken={reloadToken}
            openCreateSignal={createSignal}
            mode={mode}
            setMode={setMode}
            onSocialChange={() => { refreshFeed(); refreshProfile(); }}
          />
        </main>

        {/* Right sidebar — People to follow only, NO profile card */}
        <aside className="side side-right">
          <PeopleSuggestionsRail
            refreshKey={reloadToken + profileRefresh}
            onChanged={() => { refreshFeed(); refreshProfile(); }}
          />
        </aside>

        <BottomDock
          onHome={() => { setMode("feed"); refreshFeed(); }}
          onCreate={openCreate}
          onProfile={() => setProfileOpen(true)}
          profileOpen={profileOpen}
        />

        <ProfileDrawer
          open={profileOpen}
          onClose={() => setProfileOpen(false)}
          theme={theme}
          setTheme={setTheme}
          auth={auth}
          onLogout={logout}
          refreshKey={profileRefresh}
        />
      </div>
      <Toast message={toast} />
    </>
  );
}