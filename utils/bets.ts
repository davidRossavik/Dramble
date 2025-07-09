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

