import { useEffect, useRef } from "react";

export default function SearchBar({ onSearch }) {
  const ref = useRef();

  useEffect(() => {
    ref.current.focus();
  }, []);

  return (
    <input
      ref={ref}
      placeholder="Rechercher..."
      onChange={e => onSearch(e.target.value)}
      style={{ width: "100%", padding: 8, marginBottom: 10 }}
    />
  );
}
