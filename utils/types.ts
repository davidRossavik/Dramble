

export type Player = {
  id: string;
  name: string;
};

export type Team = {
  teamName: string;
  leader: string;
  players: Player[];
};
