import { supabase } from "../supabase";

export async function updateGameStatus(gameId: string, status: 'waiting' | 'playing' | 'finished') {
  const { error } = await supabase
    .from('games')
    .update({ status })
    .eq('id', gameId);

  if (error) {
    console.error('Feil ved oppdatering av game status:', error.message);
    return { error: 'Kunne ikke oppdatere status' };
  }

  return { error: null };
}


export async function setInitialChallenge(gameId: string) {
  const initialChallenge = {
    id: 'challenge_1',
    step: 'intro',
  };

  const { error } = await supabase
    .from('games')
    .update({ challenge: initialChallenge })
    .eq('id', gameId);

  if (error) {
    console.error('Feil ved oppstart av challenge:', error.message);
    return { error: 'Kunne ikke starte challenge' };
  }

  return { error: null };
}