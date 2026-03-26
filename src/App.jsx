import { useEffect, useState } from "react";
import { Link, Route, Routes } from "react-router-dom";
import { createItem, getItems } from "./api";

function HomePage() {
  return (
    <section className="card">
      <h1>Frontend DevOps Demo</h1>
      <p>
        This React app connects to the backend API through the environment
        variable <code>VITE_API_URL</code>.
      </p>
    </section>
  );
}

function ItemsPage() {
  const [items, setItems] = useState([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadItems = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getItems();
      setItems(data);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadItems();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError("");
    try {
      await createItem({ name: name.trim() });
      setName("");
      await loadItems();
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to add item");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="card">
      <h2>Items</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Enter item name"
          aria-label="Item name"
        />
        <button type="submit" disabled={submitting}>
          {submitting ? "Adding..." : "Add Item"}
        </button>
      </form>

      {loading && <p className="status">Loading items...</p>}
      {error && <p className="error">{error}</p>}

      {!loading && !error && (
        <ul className="item-list">
          {items.length === 0 ? (
            <li>No items found.</li>
          ) : (
            items.map((item) => <li key={item._id || item.id}>{item.name}</li>)
          )}
        </ul>
      )}
    </section>
  );
}

export default function App() {
  return (
    <div className="container">
      <nav className="nav">
        <Link to="/">Home</Link>
        <Link to="/items">Items</Link>
      </nav>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/items" element={<ItemsPage />} />
      </Routes>
    </div>
  );
}
