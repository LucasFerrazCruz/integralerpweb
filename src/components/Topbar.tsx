"use client";

import { useAuth } from "@/context/AuthContext";

export default function Topbar() {
  const { usuario } = useAuth();

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  return (
    <div
      style={{
        height: 60,
        background: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
        padding: "0 20px",
        borderBottom: "1px solid #ddd",
      }}
    >
      <span style={{ marginRight: 20 }}>{usuario?.nome}</span>

      <button onClick={logout}>Sair</button>
    </div>
  );
}
