import { useEffect, useState } from "react";

type User = { id: string; name: string };

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState("");

  const reload = () => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    reload();
  }, []);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const res = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    if (res.ok) {
      setName("");
      reload();
    } else {
      alert("Erreur lors de la création");
    }
  };

  return (
    <main style={{ fontFamily: "system-ui", padding: 24, maxWidth: 560 }}>
      <h1>Users</h1>

      <form
        onSubmit={onSubmit}
        style={{ display: "flex", gap: 8, marginBottom: 16 }}
      >
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nom…"
          style={{ flex: 1, padding: 8 }}
        />
        <button type="submit">Ajouter</button>
      </form>

      {loading ? (
        <p>Chargement…</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}

      <small style={{ opacity: 0.7, display: "block", marginTop: 16 }}>
        Dev local : Vite (5173) → proxy → Azure Functions (7071)
      </small>
    </main>
  );
}
