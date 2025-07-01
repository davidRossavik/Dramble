import { supabase } from "../supabase";
import { Player, Team } from "./types";


//henter alle rader med spill i "games" tabellen
export async function getAllGames() {
    const{data, error} = await supabase.from("games").select("*");
    if (error) {
        console.log("feil ved innhenting av games data: ", error.message)
        return [];
    }

    return data;
}



export async function getTeamForPlayer(gameId: string, playerId: string) {
  const { data: game, error } = await supabase
    .from('games')
    .select('teams')
    .eq('id', gameId)
    .single();

  if (error || !game) {
    console.error("Kunne ikke hente spill:", error);
    return null;
  }

  for (const team of game.teams as Team[]) {
    if (team.players.some(p => p.id === playerId)) {
      return team;
    }
  }

  return null;
}



export async function addPlayerToTeam(gameId: string, teamName: string, newPlayer: Player) {
  // Hent spillet først
  const { data: game, error } = await supabase
    .from('games')
    .select('teams')
    .eq('id', gameId)
    .single();

  if (error || !game) {
    return { data: null, error: 'Fant ikke spillet.' };
  }

  const updatedTeams = (game.teams as Team[]).map(team => {
    if (team.teamName === teamName) {
      // Sjekk om navnet finnes allerede i laget
      const nameExists = team.players.some(p => p.name === newPlayer.name);
      if (nameExists) {
        throw new Error('Navnet finnes allerede i laget.');
      }

      return {
        ...team,
        players: [...team.players, newPlayer],
      };
    }
    return team;
  });

  const { data: updatedGame, error: updateError } = await supabase
    .from('games')
    .update({ teams: updatedTeams })
    .eq('id', gameId)
    .select()
    .single();

  if (updateError) {
    return { data: null, error: 'Feil ved oppdatering.' };
  }

  return { data: updatedGame, error: null };
}



export async function createGame(code:string, teams: Team[]) {
    const balances: Record<string, number> = {};
    for (const team of teams) {
        balances[team.teamName] = 100; // Startslurker per lag
    }

    const { data, error } = await supabase
    .from('games')
    .insert([
      {
        code,
        teams,
        balances,
        current_challenge_index: 0,
        challenge_state: 'waiting'
      }
    ])
    .select()
    .single();

    if (error) {
        console.error('Feil ved oppretting av spill:', error.message);
        return { data: null, error: error.message };
    }

    return { data, error: null };
}