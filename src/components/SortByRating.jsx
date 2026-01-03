export default function SortByRating({ onChange }) {
  return (
    <select onChange={e => onChange(e.target.value)}>
      <option value="desc">Note : haute → basse</option>
      <option value="asc">Note : basse → haute</option>
    </select>
  );
}
