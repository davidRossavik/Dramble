import { supabase } from '../supabase';

export async function submitBet(gameId: string, teamName: string, challengeIndex: number, amount: number, betOn: string) {
  const { error } = await supabase.from('bets').insert({
    game_id: gameId,
    team_name: teamName,
    challenge_index: challengeIndex,
    amount,
    bet_on: betOn,
  });

  if (error) console.error('Feil ved innsending av bet:', error.message);
  return { error };
}

/*        GETBET-FUNKSJON
    - Henter bet for gitt game- og teamName og challengeIndex
    - Kan brukes til å vise hvor mange slurker et gitt team har bettet
    - KAN FJERNES ETTERHVERT OM IKKE BRUKES
*/

export async function getBet(gameId: string, teamName: string, challengeIndex: number) {
  const { data, error } = await supabase.from('bets').select('*').eq('game_id', gameId).eq('team_name', teamName).eq('challenge_index', challengeIndex);
  if (error) {
    console.error('Feil ved innhentning av bets: ', error);
    return [];
  }
  return data;
}


/* 
              RESOLVEBET-FUNKSJON
   - Finner alle bets for en gitt challengeIndex og gameId
   - Sjekker hvem som vant (gis inn som argument)
   - Oppdaterer lagets slurker i 'teams' basert på riktig gjett 
   - NB: Better man 5 slurker kan man enten vinne 5 slurker eller miste 5 slurker
*/
  
export async function resolveBet(gameId: string, challengeIndex: number, winner: string) {
  const { data: bets, error } = await supabase
    .from('bets')
    .select('*')
    .eq('game_id', gameId)
    .eq('challenge_index', challengeIndex);

  if (error) {
    console.error('Feil ved henting av bets: ', error);
    return;
  }

  for (const bet of bets) {
    const isCorrect = bet.bet_on === winner;
    const delta = isCorrect ? bet.amount : -bet.amount;

    // Oppdaterer slurker for laget vha. hjelpefunksjon
    const {error: updateError } = await updateTeamSlurks(gameId, bet.team_name, delta);

    if (updateError) {
      console.error(`Feil ved oppdatering for team ${bet.team_name}: `, updateError.message);
    }
  }

}

/* 
  updateTeamSlurks - Hjelpefunksjon til resolveBet
    - enkel funksjon for å oppdatere slurker for ett lag 
*/

export async function updateTeamSlurks(gameId: string, teamName: string, delta: number) {
  // Hent spillet for å finne laget
  const { data: gameData, error: fetchError } = await supabase
    .from('games')
    .select('teams, balances')
    .eq('id', gameId)
    .single();
  
  if (fetchError || !gameData) {
    console.error('Kunne ikke hente spillet: ', fetchError?.message);
    return { error: fetchError };
  }

  const teams = gameData.teams as any[];
  const balances = gameData.balances || {};
  
  // Finn laget og oppdater slurker
  const currentSlurks = balances[teamName] || 0;
  const newSlurks = Math.max(0, currentSlurks + delta);
  
  const updatedBalances = {
    ...balances,
    [teamName]: newSlurks
  };

  // Oppdatere slurker i spillet
  const { error: updateError } = await supabase
    .from('games')
    .update({ balances: updatedBalances })
    .eq('id', gameId);

  if (updateError) {
    console.error('Feil ved oppdatering av slurker: ', updateError);
  }
  return { error: updateError };
}

// Ny funksjon for å hente betting-resultater

export async function getBettingResults(gameId: string, challengeIndex: number, winner: string) {
  const { data: bets, error } = await supabase
    .from('bets')
    .select('*')
    .eq('game_id', gameId)
    .eq('challenge_index', challengeIndex);

  if (error) {
    console.error('Feil ved henting av bets: ', error);
    return [];
  }

  return bets.map(bet => ({
    teamName: bet.team_name,
    betOn: bet.bet_on,
    amount: bet.amount,
    isCorrect: bet.bet_on === winner,
    delta: bet.bet_on === winner ? bet.amount : -bet.amount
  }));
}
