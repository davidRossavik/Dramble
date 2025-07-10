

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  teamName: string;
  slurks: number;
  players: Player[];
};
