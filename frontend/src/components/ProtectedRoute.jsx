// src/components/ProtectedRoute.jsx
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0b0f] flex items-center justify-center px-4">
        <div className="text-center">
          {/* Animated logo mark */}
          <div className="relative w-14 h-14 mx-auto mb-5">
            <div
              className="w-14 h-14 rounded-[14px] animate-pulse"
              style={{
                background: "linear-gradient(135deg,#6ee7b7,#818cf8)",
                boxShadow: "0 0 32px rgba(110,231,183,.3)",
              }}
            />
            <span className="absolute inset-0 flex items-center justify-center text-2xl text-[#0a0b0f] font-black select-none">
              ✦
            </span>
          </div>

          {/* Spinner ring */}
          <div className="relative w-8 h-8 mx-auto mb-4">
            <svg
              className="animate-spin"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle
                cx="16"
                cy="16"
                r="13"
                stroke="rgba(110,231,183,0.15)"
                strokeWidth="2.5"
              />
              <path
                d="M16 3 A13 13 0 0 1 29 16"
                stroke="#6ee7b7"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          <p className="text-slate-400 text-sm font-medium tracking-wide">
            Verifying session…
          </p>
          <p className="text-slate-600 text-xs mt-1">Please wait a moment</p>
        </div>
      </div>
    );
  }

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}
