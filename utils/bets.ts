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
