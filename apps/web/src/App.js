import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
export default function App() {
    const [users, setUsers] = useState([]);
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
    const onSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim())
            return;
        const res = await fetch("/api/users", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: name.trim() }),
        });
        if (res.ok) {
            setName("");
            reload();
        }
        else {
            alert("Erreur lors de la création");
        }
    };
    return (_jsxs("main", { style: { fontFamily: "system-ui", padding: 24, maxWidth: 560 }, children: [_jsx("h1", { children: "Users" }), _jsxs("form", { onSubmit: onSubmit, style: { display: "flex", gap: 8, marginBottom: 16 }, children: [_jsx("input", { value: name, onChange: (e) => setName(e.target.value), placeholder: "Nom\u2026", style: { flex: 1, padding: 8 } }), _jsx("button", { type: "submit", children: "Ajouter" })] }), loading ? (_jsx("p", { children: "Chargement\u2026" })) : (_jsx("ul", { children: users.map((u) => (_jsx("li", { children: u.name }, u.id))) })), _jsx("small", { style: { opacity: 0.7, display: "block", marginTop: 16 }, children: "Dev local : Vite (5173) \u2192 proxy \u2192 Azure Functions (7071)" })] }));
}
