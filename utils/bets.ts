import { supabase } from '../supabase';

export async function submitBet(gameId: string, teamId: string, challengeIndex: number, amount: number, betOn: string) {
  const { error } = await supabase.from('bets').insert({
    game_id: gameId,
    team_id: teamId,
    challenge_index: challengeIndex,
    amount,
    bet_on: betOn,
  });

  if (error) console.error('Feil ved innsending av bet:', error.message);
  return { error };
}

/*        GETBET-FUNKSJON
    - Henter bet for gitt game- og teamId og challengeIndex
    - Kan brukes til å vise hvor mange slurker et gitt team har bettet
    - KAN FJERNES ETTERHVERT OM IKKE BRUKES
*/

export async function getBet(gameId: string, teamId: string, challengeIndex: number) {
  const { data, error } = await supabase.from('bets').select('*').eq('gameId', gameId).eq('teamId', teamId).eq('challengeIndex', challengeIndex);
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
    const {error: updateError } = await updateTeamSlurks(bet.team_id, delta);

    if (updateError) {
      console.error('Feil ved oppdatering for team ${bet.team_id}: ', updateError.message);
    }
  }

}

/* 
  updateTeamSlurks - Hjelpefunksjon til resolveBet
    - enkel funksjon for å oppdatere slurker for ett lag 
*/

export async function updateTeamSlurks(teamId: string, delta: number) {
  // hent laget
  const { data: teamData, error: fetchError } = await supabase .from('teams').select('slurks').eq('id', teamId).single();
  
  if (fetchError || !teamData) {
    console.error('Kunne ikke hente laget: ', fetchError?.message);
    return { error: fetchError };
  }

  // Kalkulere ny slurke-verdi (max 0)
  const newSlurks = Math.max(0, teamData.slurks + delta);

  // Oppdatere slurker på laget
  const { error: updateError } = await supabase.from('teams').update({slurks: newSlurks }).eq('id', teamId);

  if (updateError) {
    console.error('Feil ved oppdatering av slurker: ', updateError);
  }
  return { error: updateError };
}
