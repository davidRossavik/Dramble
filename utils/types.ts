

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

