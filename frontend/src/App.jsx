import React, { useEffect, useRef, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [searchName, setSearchName] = useState("");
  const [snapshotTime, setSnapshotTime] = useState("");
  const [nextCursor, setNextCursor] = useState(null);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loaderRef = useRef(null);
  const API_URL = process.env.REACT_APP_API_URL;
  const load = async (reset = false, cat = category) => {
    if (loading) return;

    setLoading(true);

    try {
      let url = `${API_URL}/products?limit=20`;

      // Search by product name
      if (searchName.trim()) {
        url += `&name=${encodeURIComponent(searchName.trim())}`;
      }

      // Filter by category
      if (cat) {
        url += `&category=${encodeURIComponent(cat)}`;
      }

      // Snapshot pagination
      if (!reset && snapshotTime) {
        url += `&snapshotTime=${encodeURIComponent(snapshotTime)}`;
      }

      // Cursor pagination
      if (!reset && nextCursor) {
        url += `&cursorUpdatedAt=${encodeURIComponent(
          nextCursor.updatedAt
        )}`;
        url += `&cursorId=${nextCursor.id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setTotalCount(data.totalCount || 0);

      if (reset) {
        setProducts(data.products || []);
        setSnapshotTime(data.snapshotTime);
      } else {
        setProducts((prev) => [...prev, ...(data.products || [])]);
      }

      setNextCursor(data.nextCursor);
      setHasMore(!!data.nextCursor);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    load(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !loading &&
          nextCursor
        ) {
          load(false);
        }
      },
      {
        rootMargin: "200px",
      }
    );

    const current = loaderRef.current;

    if (current) {
      observer.observe(current);
    }

    return () => {
      if (current) {
        observer.unobserve(current);
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loading, nextCursor]);

  const handleSearch = () => {
    setProducts([]);
    setNextCursor(null);
    setSnapshotTime("");
    setHasMore(true);
    load(true);
  };

  const changeCategory = (e) => {
    const cat = e.target.value;

    setCategory(cat);
    setProducts([]);
    setNextCursor(null);
    setSnapshotTime("");
    setHasMore(true);

    load(true, cat);
  };

  return (
    <div className="container">
      <h1>
        Product Browser ({totalCount.toLocaleString()} Products)
      </h1>

      <div
        style={{
          display: "flex",
          gap: "10px",
          marginBottom: "20px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          placeholder="Search by Product Name"
          value={searchName}
          onChange={(e) => setSearchName(e.target.value)}
          style={{
            padding: "10px",
            width: "300px",
          }}
        />

        <button onClick={handleSearch}>
          Search
        </button>

        <select value={category} onChange={changeCategory}>
          <option value="">All Categories</option>
          <option value="Electronics">Electronics</option>
          <option value="Books">Books</option>
          <option value="Fashion">Fashion</option>
          <option value="Sports">Sports</option>
        </select>
      </div>

      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p._id}>
            <h3>{p.name}</h3>
            <p>{p.category}</p>
            <strong>₹{p.price}</strong>
          </div>
        ))}
      </div>

      <div
        ref={loaderRef}
        style={{
          textAlign: "center",
          padding: "30px",
        }}
      >
        {loading
          ? "Loading..."
          : hasMore
          ? "Scroll down to load more products"
          : "No more products"}
      </div>
    </div>
  );
}

export default App;