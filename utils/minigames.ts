export type MinigameType = 'flaks' | 'spinTheWheel' | 'roulette' | 'upOrDown';

export interface MinigameResult {
  type: MinigameType;
  won: boolean;
  slurksGained: number;
  slurksLost: number;
  playerName?: string;
  teamName?: string;
}

export interface MinigameParams {
  gameId: string;
  challengeIndex: number;
  playerName?: string;
  teamName?: string;
}

/**
 * Sjekker om minigame skal trigges basert på challenge index
 */
export function shouldTriggerMinigame(challengeIndex: number): boolean {
  return challengeIndex === 5; // Trigger ved index 5
}

/**
 * Velger et tilfeldig minigame
 */
export function getRandomMinigame(): MinigameType {
  const games: MinigameType[] = ['flaks', 'spinTheWheel', 'roulette', 'upOrDown'];
  return games[Math.floor(Math.random() * games.length)];
}

/**
 * Hjelpefunksjon for å formatere minigame resultat
 */
export function formatMinigameResult(
  type: MinigameType,
  won: boolean,
  slurks: number,
  playerName?: string,
  teamName?: string
): MinigameResult {
  return {
    type,
    won,
    slurksGained: won ? slurks : 0,
    slurksLost: won ? 0 : slurks,
    playerName,
    teamName,
  };
}

/**
 * Henter minigame navn for visning
 */
export function getMinigameDisplayName(type: MinigameType): string {
  switch (type) {
    case 'flaks':
      return 'Flaks';
    case 'spinTheWheel':
      return 'Spin the Wheel';
    case 'roulette':
      return 'Roulette';
    case 'upOrDown':
      return 'Up or Down';
    default:
      return 'Minigame';
  }
} 