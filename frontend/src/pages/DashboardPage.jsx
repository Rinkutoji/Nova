// src/pages/DashboardPage.jsx
// This page fetches real data from the Spring Boot API
// and passes it into the Dashboard UI component.

import { useState, useEffect, useCallback } from "react";
import { useAuth }           from "../context/AuthContext";
import { projectsApi }       from "../api/projects";
import { notificationsApi }  from "../api/notifications";
import { usersApi }          from "../api/users";
import NovaDashboard         from "../components/Dashboard";

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();

  const [projects,  setProjects]  = useState([]);
  const [notifs,    setNotifs]    = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // ── Fetch initial data ─────────────────────────────────────────────
  const fetchAll = useCallback(async () => {
    try {
      const [projRes, notifRes] = await Promise.all([
        projectsApi.list(),
        notificationsApi.list(),
      ]);
      setProjects(projRes.data);
      setNotifs(notifRes.data);
    } catch (err) {
      console.error("Failed to load data:", err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  // ── Project actions ────────────────────────────────────────────────
  const createProject = async (data) => {
    const res = await projectsApi.create(data);
    setProjects(prev => [res.data, ...prev]);
    return res.data;
  };

  const updateProject = async (id, data) => {
    const res = await projectsApi.update(id, data);
    setProjects(prev => prev.map(p => p.id === id ? res.data : p));
    return res.data;
  };

  const patchProjectStatus = async (id, status) => {
    const res = await projectsApi.patchStatus(id, status);
    setProjects(prev => prev.map(p => p.id === id ? res.data : p));
  };

  const deleteProject = async (id) => {
    await projectsApi.remove(id);
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // ── Notification actions ───────────────────────────────────────────
  const markNotifRead = async (id) => {
    await notificationsApi.markRead(id);
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, unread: false } : n));
  };

  const markAllNotifsRead = async () => {
    await notificationsApi.markAllRead();
    setNotifs(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotif = async (id) => {
    await notificationsApi.remove(id);
    setNotifs(prev => prev.filter(n => n.id !== id));
  };

  // ── Profile actions ────────────────────────────────────────────────
  const updateProfile = async (data) => {
    const res = await usersApi.updateProfile(data);
    updateUser({ name: data.name, email: data.email });
    return res.data;
  };

  const changePassword = async (data) => {
    return usersApi.changePassword(data);
  };

  const deleteAccount = async () => {
    await usersApi.deleteAccount();
    logout();
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 rounded-[10px] mx-auto mb-4 animate-pulse"
            style={{background:"linear-gradient(135deg,#6ee7b7,#818cf8)"}}/>
          <p className="text-slate-400 text-sm" style={{fontFamily:"DM Sans,sans-serif"}}>Loading workspace…</p>
        </div>
      </div>
    );
  }

  return (
    <NovaDashboard
      // Auth
      user={user}
      onLogout={logout}

      // Projects
      projects={projects}
      onCreateProject={createProject}
      onUpdateProject={updateProject}
      onPatchProjectStatus={patchProjectStatus}
      onDeleteProject={deleteProject}

      // Notifications
      notifications={notifs}
      onMarkNotifRead={markNotifRead}
      onMarkAllNotifsRead={markAllNotifsRead}
      onDeleteNotif={deleteNotif}

      // Profile
      onUpdateProfile={updateProfile}
      onChangePassword={changePassword}
      onDeleteAccount={deleteAccount}
    />
  );
}
