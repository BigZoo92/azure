import { useEffect, useState } from "react";

type User = { id: string; name: string };

export default function App() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch("/api/users")
      .then((r) => r.json())
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <main style={{ fontFamily: "system-ui", padding: 24 }}>
      <h1>Users</h1>
      {loading ? (
        <p>Chargement…</p>
      ) : (
        <ul>
          {users.map((u) => (
            <li key={u.id}>{u.name}</li>
          ))}
        </ul>
      )}
      <small style={{ opacity: 0.7 }}>
        Frontend React/Vite — backend en Azure Functions (à brancher étape 2)
      </small>
    </main>
  );
}
