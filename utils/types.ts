

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  teamName: string;
  slurks: number;
  players: Player[];
};

export type Challenge = {
  title: string;
  description: string;
  category: string;
  type: '1v1' | 'Team-vs-Team' | 'Team-vs-itself';
  odds: string;
  participants?: string[];
};

// Ny rundeobjekt type som inneholder alt for en runde
export type Runde = {
  challenge: Challenge;
  challengeIndex: number;
  teams: Team[];
  selectedTeams: Team[];
  winner: string | null;
  betResults: BetResult[];
  state: RundeState;
};

// Runde state type
export type RundeState = 'betting' | 'playing' | 'finished';

// Betting result type
export type BetResult = {
  teamName: string;
  betOn: string;
  amount: number;
  isCorrect: boolean;
  delta: number;
};

