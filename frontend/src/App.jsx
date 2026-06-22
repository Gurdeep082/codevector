import React, { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [products, setProducts] = useState([]);
  const [category, setCategory] = useState("");
  const [snapshotTime, setSnapshotTime] = useState("");
  const [nextCursor, setNextCursor] = useState(null);

  const load = async (reset = false, cat = category) => {
    try {
      let url = "http://localhost:5000/products?limit=20";

      if (cat) {
        url += `&category=${cat}`;
      }

      if (snapshotTime && !reset) {
        url += `&snapshotTime=${snapshotTime}`;
      }

      if (nextCursor && !reset) {
        url += `&cursorUpdatedAt=${nextCursor.updatedAt}`;
        url += `&cursorId=${nextCursor.id}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      if (reset) {
        setProducts(data.products || []);
        setSnapshotTime(data.snapshotTime);
      } else {
        setProducts((prev) => [...prev, ...(data.products || [])]);
      }

      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    load(true);
  }, []);

  const changeCategory = async (e) => {
    const cat = e.target.value;

    setCategory(cat);
    setProducts([]);
    setNextCursor(null);
    setSnapshotTime("");

    try {
      let url = "http://localhost:5000/products?limit=20";

      if (cat) {
        url += `&category=${cat}`;
      }

      const res = await fetch(url);
      const data = await res.json();

      setProducts(data.products || []);
      setSnapshotTime(data.snapshotTime);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="container">
      <h1>Product Browser (200K Products)</h1>

      <select onChange={changeCategory} value={category}>
        <option value="">All Categories</option>
        <option value="Electronics">Electronics</option>
        <option value="Books">Books</option>
        <option value="Fashion">Fashion</option>
        <option value="Sports">Sports</option>
      </select>

      <div className="grid">
        {products.map((p) => (
          <div className="card" key={p._id}>
            <h3>{p.name}</h3>
            <p>{p.category}</p>
            <strong>₹{p.price}</strong>
          </div>
        ))}
      </div>

      {nextCursor && (
        <button onClick={() => load(false)}>
          Load More
        </button>
      )}
    </div>
  );
}

export default App;