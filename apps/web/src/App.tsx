import { useEffect, useMemo, useState } from "react";
import {
  createOrUpdateUser,
  getMe,
  getVotes,
  login,
  logout,
  sendVote,
  type ClientPrincipal,
  type VotesStats,
} from "./api";

export default function App() {
  const [me, setMe] = useState<ClientPrincipal | null>(null);
  const [pseudo, setPseudo] = useState("");
  const [userSaved, setUserSaved] = useState(false);
  const [stats, setStats] = useState<VotesStats | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  // Charger identité + stats au chargement
  useEffect(() => {
    (async () => {
      try {
        const p = await getMe();
        setMe(p);
      } catch {
        /* ignore */
      }
      try {
        const s = await getVotes();
        setStats(s);
      } catch (e: any) {
        setMsg(e?.message || "Erreur de chargement des votes");
      }
    })();
  }, []);

  // Rafraîchissement périodique des stats (toutes les 5s)
  useEffect(() => {
    const id = setInterval(async () => {
      try {
        const s = await getVotes();
        setStats(s);
      } catch {
        /* ignore */
      }
    }, 5000);
    return () => clearInterval(id);
  }, []);

  const isAuth = !!me && me.userRoles?.includes("authenticated");
  const ratioYesPct = useMemo(
    () =>
      stats && stats.total ? Math.round((stats.yes / stats.total) * 100) : 0,
    [stats]
  );

  async function onSaveUser(e: React.FormEvent) {
    e.preventDefault();
    if (!isAuth) return login();
    if (!pseudo.trim()) return setMsg("Merci de saisir un pseudo.");
    setBusy(true);
    setMsg(null);
    try {
      await createOrUpdateUser(pseudo.trim());
      setUserSaved(true);
      setMsg("Profil enregistré ✅");
    } catch (e: any) {
      setMsg(e?.message || "Erreur lors de l’enregistrement");
    } finally {
      setBusy(false);
    }
  }

  async function onVote(choice: "yes" | "no") {
    if (!isAuth) return login();
    if (!userSaved && !pseudo.trim())
      return setMsg("Enregistre d’abord ton pseudo.");
    setBusy(true);
    setMsg(null);
    try {
      await sendVote(choice);
      const s = await getVotes();
      setStats(s);
      setMsg(`Vote "${choice === "yes" ? "Oui" : "Non"}" pris en compte ✅`);
    } catch (e: any) {
      setMsg(e?.message || "Erreur lors du vote");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={styles.page}>
      <header style={styles.header}>
        <h1 style={{ margin: 0 }}>🗳️ Sondage express</h1>
        <div>
          {isAuth ? (
            <button onClick={logout} style={styles.linkBtn}>
              Se déconnecter
            </button>
          ) : (
            <button onClick={login} style={styles.cta}>
              Se connecter
            </button>
          )}
        </div>
      </header>

      <section style={styles.card}>
        <h2 style={styles.h2}>Identité</h2>
        {isAuth ? (
          <>
            <p style={styles.dim}>
              Connecté via <b>{me!.identityProvider}</b>
              {me!.userDetails ? (
                <>
                  {" "}
                  — <span>{me!.userDetails}</span>
                </>
              ) : null}
            </p>
            <form
              onSubmit={onSaveUser}
              style={{ display: "flex", gap: 8, alignItems: "center" }}
            >
              <input
                style={styles.input}
                placeholder="Ton pseudo"
                value={pseudo}
                onChange={(e) => setPseudo(e.target.value)}
              />
              <button style={styles.btn} disabled={busy}>
                Enregistrer
              </button>
              {userSaved && <span style={styles.badge}>OK</span>}
            </form>
          </>
        ) : (
          <p style={styles.dim}>Connecte-toi pour participer.</p>
        )}
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>Question</h2>
        <p>
          <b>Est-ce que François Bayrou nous manque ?</b>
        </p>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={styles.btn}
            onClick={() => onVote("yes")}
            disabled={busy}
          >
            Oui
          </button>
          <button
            style={styles.btn}
            onClick={() => onVote("no")}
            disabled={busy}
          >
            Non
          </button>
        </div>
      </section>

      <section style={styles.card}>
        <h2 style={styles.h2}>Résultats</h2>
        {stats ? (
          <>
            <p>
              Total: <b>{stats.total}</b> — Oui: <b>{stats.yes}</b> — Non:{" "}
              <b>{stats.no}</b>
            </p>
            <div style={styles.progressBox}>
              <div
                style={{ ...styles.progressYes, width: `${ratioYesPct}%` }}
              />
            </div>
            <p className="dim">Oui: {ratioYesPct}%</p>
          </>
        ) : (
          <p style={styles.dim}>Chargement…</p>
        )}
      </section>

      {msg && <div style={styles.toast}>{msg}</div>}

      <footer style={styles.footer}>
        <a href="/.auth/me" style={styles.link}>
          Voir mon profil (.auth/me)
        </a>
      </footer>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    maxWidth: 780,
    margin: "24px auto",
    padding: "0 16px",
    fontFamily: "ui-sans-serif, system-ui, Arial",
    color: "#111",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  card: {
    border: "1px solid #e5e7eb",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
  },
  h2: { marginTop: 0, marginBottom: 12, fontSize: 18 },
  dim: { color: "#6b7280", marginTop: 0 },
  input: {
    border: "1px solid #d1d5db",
    borderRadius: 8,
    padding: "10px 12px",
    flex: 1,
  },
  btn: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #d1d5db",
    background: "#f3f4f6",
    cursor: "pointer",
  },
  cta: {
    padding: "10px 14px",
    borderRadius: 8,
    border: "1px solid #2563eb",
    background: "#2563eb",
    color: "white",
    cursor: "pointer",
  },
  linkBtn: {
    padding: "8px 12px",
    borderRadius: 8,
    border: "1px solid #e5e7eb",
    background: "white",
    cursor: "pointer",
  },
  badge: { marginLeft: 4, fontSize: 12, color: "#059669" },
  progressBox: {
    height: 10,
    background: "#f3f4f6",
    borderRadius: 8,
    overflow: "hidden",
    marginTop: 8,
    marginBottom: 4,
  },
  progressYes: { height: "100%", background: "#10b981" },
  toast: {
    marginTop: 8,
    padding: 10,
    background: "#fef3c7",
    border: "1px solid #f59e0b",
    borderRadius: 8,
  },
  footer: { textAlign: "center", marginTop: 24, color: "#6b7280" },
  link: { color: "#2563eb", textDecoration: "underline" },
};
