import { supabase } from "../supabase";
import { Player, Team } from "./types";










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



export async function createGame(code:string, teams: Team[], startSlurks: number) {
    const balances: Record<string, number> = {};
    for (const team of teams) {
        balances[team.teamName] = startSlurks;
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



export async function getGameByCode(code: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('code', code)
    .single();

  if (error) {
    console.error("Feil ved henting av spill:", error.message);
    return { data: null, error };
  }

  return { data, error: null };
}




export async function addTeamToGame(gameId: string, newTeam: Team, slurker: number) {
  const { data: game, error } = await supabase
    .from('games')
    .select('teams, balances')
    .eq('id', gameId)
    .single();

  if (error || !game) {
    console.error('Kunne ikke hente spill:', error?.message);
    return { error: 'Fant ikke spillet' };
  }


  const updatedBalances = {
    ...(game.balances ?? {}), [newTeam.teamName]:slurker,
  };

  const updatedTeams = [...(game.teams ?? []), newTeam];

  const { error: updateError } = await supabase
    .from('games')
    .update({ teams: updatedTeams, balances:updatedBalances })
    .eq('id', gameId);

  if (updateError) {
    console.error('Feil ved oppdatering:', updateError.message);
    return { error: 'Kunne ikke legge til lag' };
  }

  return { error: null };
}



export async function removePlayerFromTeam(gameId: string, teamName: string, playerId: string) {
  const { data, error } = await supabase
    .from('games')
    .select('teams')
    .eq('id', gameId)
    .single();

  if (error || !data) return { error: 'Fant ikke spillet' };

  const updatedTeams = (data.teams as Team[]).map((team) => {
    if (team.teamName === teamName) {
      return {
        ...team,
        players: team.players.filter((p) => p.id !== playerId),
      };
    }
    return team;
  });

  const { error: updateError } = await supabase
    .from('games')
    .update({ teams: updatedTeams })
    .eq('id', gameId);

  return { error: updateError };
}




export async function removeTeam(gameId: string, teamName: string) {
  // Hent nåværende teams fra databasen
  const { data, error } = await supabase
    .from('games')
    .select('teams')
    .eq('id', gameId)
    .single();

  if (error || !data) {
    return { error: 'Fant ikke spillet' };
  }

  // Typesikker transformasjon av teams
  const updatedTeams = (data.teams as Team[]).filter((team) => team.teamName !== teamName);

  // Oppdater raden i Supabase med de nye teamene
  const { error: updateError } = await supabase
    .from('games')
    .update({ teams: updatedTeams })
    .eq('id', gameId);

  return { error: updateError };
}

// Nye funksjoner for å håndtere valgte teams for challenges

export async function setSelectedTeamsForChallenge(gameId: string, challengeIndex: number, selectedTeams: Team[]) {
  const { data, error } = await supabase
    .from('games')
    .select('selected_teams')
    .eq('id', gameId)
    .single();

  if (error) {
    console.error('Feil ved henting av selected_teams:', error);
    return { error };
  }

  try {
    // Parse JSON hvis det er en string, ellers bruk direkte
    const currentSelectedTeams = typeof data?.selected_teams === 'string' 
      ? JSON.parse(data.selected_teams) 
      : (data?.selected_teams || {});
    
    const updatedSelectedTeams = {
      ...currentSelectedTeams,
      [challengeIndex]: selectedTeams
    };

    const { error: updateError } = await supabase
      .from('games')
      .update({ selected_teams: updatedSelectedTeams })
      .eq('id', gameId);

    if (updateError) {
      console.error('Feil ved oppdatering av selected_teams:', updateError);
    }

    return { error: updateError };
  } catch (parseError) {
    console.error('Feil ved parsing av selected_teams:', parseError);
    return { error: parseError };
  }
}

export async function getSelectedTeamsForChallenge(gameId: string, challengeIndex: number): Promise<Team[]> {
  const { data, error } = await supabase
    .from('games')
    .select('selected_teams')
    .eq('id', gameId)
    .single();

  if (error) {
    console.error('Feil ved henting av selected_teams:', error);
    return [];
  }
  if (!data?.selected_teams) {
    // Ikke logg som error, dette er normalt hvis ingen lag er valgt enda
    return [];
  }

  try {
    const selectedTeams = typeof data.selected_teams === 'string'
      ? JSON.parse(data.selected_teams)
      : data.selected_teams;
    return selectedTeams[challengeIndex] || [];
  } catch (parseError) {
    console.error('Feil ved parsing av selected_teams:', parseError);
    return [];
  }
}

// Nye funksjoner for å håndtere vinner-seleksjon

export async function setWinnerForChallenge(gameId: string, challengeIndex: number, winner: string) {
  const { data, error } = await supabase
    .from('games')
    .select('challenge_winners')
    .eq('id', gameId)
    .single();

  if (error) {
    console.error('Feil ved henting av challenge_winners:', error);
    return { error };
  }

  try {
    // Parse JSON hvis det er en string, ellers bruk direkte
    const currentWinners = typeof data?.challenge_winners === 'string' 
      ? JSON.parse(data.challenge_winners) 
      : (data?.challenge_winners || {});
    
    const updatedWinners = {
      ...currentWinners,
      [challengeIndex]: winner
    };

    const { error: updateError } = await supabase
      .from('games')
      .update({ challenge_winners: updatedWinners })
      .eq('id', gameId);

    if (updateError) {
      console.error('Feil ved oppdatering av challenge_winners:', updateError);
    }

    return { error: updateError };
  } catch (parseError) {
    console.error('Feil ved parsing av challenge_winners:', parseError);
    return { error: parseError };
  }
}

export async function getWinnerForChallenge(gameId: string, challengeIndex: number): Promise<string | null> {
  const { data, error } = await supabase
    .from('games')
    .select('challenge_winners')
    .eq('id', gameId)
    .single();

  if (error) {
    console.error('Feil ved henting av challenge_winners:', error);
    return null;
  }
  if (!data?.challenge_winners) {
    // Ikke logg som error, dette er normalt hvis ingen vinner er valgt ennå
    return null;
  }

  try {
    const challengeWinners = typeof data.challenge_winners === 'string'
      ? JSON.parse(data.challenge_winners)
      : data.challenge_winners;
    return challengeWinners[challengeIndex] || null;
  } catch (parseError) {
    console.error('Feil ved parsing av challenge_winners:', parseError);
    return null;
  }
}

export async function updateBalances(gameId: string, balances: Record<string, number>) {
  const { error } = await supabase
    .from('games')
    .update({ balances })
    .eq('id', gameId);
  return { error };
}