export const loadGame = () => {
  if (typeof window === "undefined") return null;
  const saved = localStorage.getItem("gameState");
  return saved ? JSON.parse(saved) : null;
};

export const saveGame = (data: any) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("gameState", JSON.stringify(data));
};
