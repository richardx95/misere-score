export default function ScoreTable({ players }: any) {
  return (
    <table className="min-w-full border mt-4">
      <thead>
        <tr>
          <th>Speler</th>
          <th>Score</th>
        </tr>
      </thead>
      <tbody>
        {players.map((p: any) => (
          <tr key={p.id}>
            <td>{p.name}</td>
            <td>{p.score}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
