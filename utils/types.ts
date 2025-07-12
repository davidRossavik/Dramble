

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  teamName: string;
  sips: number;
  players: Player[];
};
