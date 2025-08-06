import { supabase } from "../supabase-functions/supabase.js";
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



export async function createGame(code:string, teams: Team[], startSlurks: number, hostName: string) {
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
        challenge_state: 'waiting',
        hostName
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

export async function getGameById(id: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error("Feil ved henting av spill på id:", error.message);
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

  console.log('Lag lagt til i database:', newTeam.teamName);
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

export async function randomizePlayers(gameId: string, teams: Team[] = []) {
  // Hent fersk data fra databasen for å sikre at vi har alle lag
  const { data: freshGame, error: fetchError } = await supabase
    .from('games')
    .select('teams')
    .eq('id', gameId)
    .single();

  if (fetchError || !freshGame) {
    console.error('Kunne ikke hente fersk spilldata:', fetchError);
    return { error: 'Kunne ikke hente spilldata' };
  }

  const freshTeams = freshGame.teams as Team[];
  console.log('Fersk teams data for randomisering:', freshTeams);

  if (freshTeams.length < 2) {
    return { error: 'Trenger minst 2 lag for å fordele spillere' };
  }

  try {
    // Samle alle spillere som ikke er lagledere
    const nonTeamLeaders: { player: any; originalTeam: string }[] = [];
    freshTeams.forEach(team => {
      team.players.slice(1).forEach(player => { // slice(1) hopper over laglederen
        nonTeamLeaders.push({ player, originalTeam: team.teamName });
      });
    });

    if (nonTeamLeaders.length === 0) {
      return { error: 'Ingen spillere å fordele' };
    }

    // Bland spillere tilfeldig
    const shuffledPlayers = [...nonTeamLeaders].sort(() => Math.random() - 0.5);

    // Opprett nye lag med lagledere + balansert fordeling
    const newTeams = freshTeams.map(team => ({
      ...team,
      players: [team.players[0]] // Start med kun laglederen
    }));

    // Beregn lag-størrelser (algoritmen du beskrev)
    const totalPlayers = shuffledPlayers.length;
    const totalTeams = freshTeams.length;
    const base = Math.floor(totalPlayers / totalTeams);
    const rest = totalPlayers % totalTeams;
    
    // Opprett array med antall spillere per lag
    const teamSizes = new Array(totalTeams).fill(base);
    for (let i = 0; i < rest; i++) {
      teamSizes[i] += 1;
    }
    
    // Fordel spillere til lagene
    let playerIndex = 0;
    teamSizes.forEach((size, teamIndex) => {
      for (let i = 0; i < size; i++) {
        newTeams[teamIndex].players.push(shuffledPlayers[playerIndex].player);
        playerIndex++;
      }
    });
    
    // Oppdater databasen
    const { error } = await supabase
      .from('games')
      .update({ teams: newTeams })
      .eq('id', gameId);

    if (error) {
      console.error('Feil ved randomisering av spillere:', error);
      return { error: 'Kunne ikke oppdatere lagene' };
    }

    return { data: newTeams, error: null };
  } catch (error) {
    console.error('Feil ved randomisering av spillere:', error);
    return { error: 'Uventet feil ved randomisering' };
  }
}

// Ny funksjon for å sjekke om et lag allerede har plassert et bet
export async function hasTeamPlacedBet(gameId: string, teamName: string, challengeIndex: number) {
  const { data: bets, error } = await supabase
    .from('bets')
    .select('*')
    .eq('game_id', gameId)
    .eq('team_name', teamName)
    .eq('challenge_index', challengeIndex);

  if (error) {
    console.error('Feil ved sjekking av eksisterende bet:', error);
    return false;
  }

  return bets && bets.length > 0;
}

// Ny funksjon for å slette et spill når host forlater
export async function deleteGame(gameId: string) {
  console.log('🗑️ Starting cleanup for game:', gameId);
  
  try {
    // 1. Slett alle bets for dette spillet først
    const { error: betsError } = await supabase
      .from('bets')
      .delete()
      .eq('game_id', gameId);

    if (betsError) {
      console.error('Feil ved sletting av bets:', betsError);
      return { error: betsError };
    }

    console.log('✅ Bets deleted for game:', gameId);

    // 2. Slett spillet fra games tabellen
    const { error: gameError } = await supabase
      .from('games')
      .delete()
      .eq('id', gameId);

  if (gameError) {
    console.error('Feil ved sletting av spill:', gameError);
    return { gameError };
  }

  return { error: null };
}
catch (error) {
  console.error('Feil ved sletting av spill:', error);
  return { error };
}}
