import { supabase } from "../supabase";
import { getRandomChallenges } from './challenges';


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
  const testChallenge = {
    id: 'test_1',
    text: '1v1: Steinsaks–papir mellom to lagledere. Vinneren slipper å drikke.',
    type: '1v1',
    };

  const { error } = await supabase
    .from('games')
    .update({ challenge: testChallenge , challenge_status: "betting"})
    .eq('id', gameId);

  if (error) {
    console.error('Feil ved oppstart av challenge:', error.message);
    return { error: 'Kunne ikke starte challenge' };
  }

  return { error: null };
}


export async function initializeGame(gameId: string) {
  const challenges = getRandomChallenges(10);

  const { error } = await supabase
    .from('games')
    .update({
      challenges,
      currentChallengeIndex: 0,
      challenge_state: 'betting'
    })
    .eq('id', gameId);

  if (error) {
    console.error('Feil ved start:', error.message);
  }

  return { error };
}