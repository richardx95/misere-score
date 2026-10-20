type Player = {
  id: number;
  name: string;
};

type Round = {
  changes?: number[];
};

type ScoreHistoryChartProps = {
  players: Player[];
  rounds: Round[];
};

const PLAYER_COLORS = [
  "#C62828",
  "#D35400",
  "#A67C00",
  "#2E7D32",
  "#1565C0",
  "#212121",
];

const CHART_HEIGHT = 300;
const PLOT_TOP = 20;
const PLOT_BOTTOM = 46;
const PLOT_LEFT = 58;
const PLOT_RIGHT = 20;

export default function ScoreHistoryChart({
  players,
  rounds,
}: ScoreHistoryChartProps) {
  if (rounds.length === 0) {
    return (
      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Scoreverloop</h2>
        <p className="text-sm text-gray-600">
          De grafiek verschijnt zodra de eerste ronde is gespeeld.
        </p>
      </section>
    );
  }

  const scores = players.map((player) => [
    0,
    ...rounds.reduce<number[]>((history, round) => {
      const previousScore = history[history.length - 1];
      history.push(previousScore + (round.changes?.[player.id] ?? 0));
      return history;
    }, []),
  ]);
  const allScores = scores.flat();
  const scoreMin = Math.min(...allScores);
  const scoreMax = Math.max(...allScores);
  const roughStep = (scoreMax - scoreMin || 10) / 4;
  const stepMagnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalizedStep = roughStep / stepMagnitude;
  const stepFactor =
    normalizedStep <= 1 ? 1 : normalizedStep <= 2 ? 2 : normalizedStep <= 5 ? 5 : 10;
  const yStep = stepFactor * stepMagnitude;
  const yMin = Math.floor(scoreMin / yStep) * yStep;
  const yMax = Math.max(yMin + yStep, Math.ceil(scoreMax / yStep) * yStep);
  const yTicks = Array.from(
    { length: Math.round((yMax - yMin) / yStep) + 1 },
    (_, index) => yMin + index * yStep
  );

  const width = Math.max(640, (rounds.length + 1) * 72 + PLOT_LEFT + PLOT_RIGHT);
  const plotWidth = width - PLOT_LEFT - PLOT_RIGHT;
  const plotHeight = CHART_HEIGHT - PLOT_TOP - PLOT_BOTTOM;
  const x = (index: number) =>
    PLOT_LEFT + (index / rounds.length) * plotWidth;
  const y = (score: number) =>
    PLOT_TOP + ((yMax - score) / (yMax - yMin)) * plotHeight;
  const xLabelStride = Math.max(1, Math.ceil(rounds.length / 10));

  return (
    <section className="space-y-2">
      <h2 className="text-lg font-semibold">Scoreverloop</h2>
      <div className="overflow-x-auto">
        <svg
          aria-label="Grafiek van het scoreverloop per speler"
          className="block max-w-none"
          height={CHART_HEIGHT}
          role="img"
          viewBox={`0 0 ${width} ${CHART_HEIGHT}`}
          width={width}
        >
          {yTicks.map((tick) => (
            <g key={tick}>
              <line
                x1={PLOT_LEFT}
                x2={width - PLOT_RIGHT}
                y1={y(tick)}
                y2={y(tick)}
                stroke="#E5E7EB"
              />
              <text
                x={PLOT_LEFT - 10}
                y={y(tick)}
                fill="#4B5563"
                fontSize="12"
                textAnchor="end"
                dominantBaseline="middle"
              >
                {tick}
              </text>
            </g>
          ))}

          {Array.from({ length: rounds.length + 1 }, (_, index) => index)
            .filter(
              (index) =>
                index === 0 ||
                index === rounds.length ||
                index % xLabelStride === 0
            )
            .map((index) => (
              <g key={index}>
                <line
                  x1={x(index)}
                  x2={x(index)}
                  y1={PLOT_TOP}
                  y2={CHART_HEIGHT - PLOT_BOTTOM}
                  stroke="#F3F4F6"
                />
                <text
                  x={x(index)}
                  y={CHART_HEIGHT - PLOT_BOTTOM + 20}
                  fill="#4B5563"
                  fontSize="12"
                  textAnchor="middle"
                >
                  {index === 0 ? "Start" : index}
                </text>
              </g>
            ))}

          {players.map((player, playerIndex) => (
            <g key={player.id}>
              <polyline
                fill="none"
                points={scores[playerIndex]
                  .map((score, index) => `${x(index)},${y(score)}`)
                  .join(" ")}
                stroke={PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]}
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              />
              {scores[playerIndex].map((score, index) => (
                <circle
                  key={index}
                  cx={x(index)}
                  cy={y(score)}
                  fill={PLAYER_COLORS[playerIndex % PLAYER_COLORS.length]}
                  r="3.5"
                />
              ))}
            </g>
          ))}
        </svg>
      </div>

      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
        {players.map((player, playerIndex) => (
          <li className="flex items-center gap-2" key={player.id}>
            <span
              aria-hidden="true"
              className="inline-block h-3 w-3 rounded-full"
              style={{
                backgroundColor:
                  PLAYER_COLORS[playerIndex % PLAYER_COLORS.length],
              }}
            />
            {player.name}
          </li>
        ))}
      </ul>
    </section>
  );
}
