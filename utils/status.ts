import { supabase } from "../supabase";
import { getRandomChallengesWithPlayers } from './challenges';
import { selectTeamsForChallenge } from './rounds';


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







//kjøres når hosten trykker på start spill første gang
export async function initializeGame(gameId: string) {
  const challenges = await getRandomChallengesWithPlayers(gameId, 1);

  // Hent alle lag for å velge automatisk
  const { data: game, error: gameError } = await supabase
    .from('games')
    .select('teams')
    .eq('id', gameId)
    .single();

  if (gameError || !game) {
    console.error('Feil ved henting av lag:', gameError);
    return { error: gameError };
  }

  const teams = game.teams || [];
  
  // Velg lag basert på første challenge type
  const firstChallenge = challenges[0];
  const teamsToSelect = selectTeamsForChallenge(teams, firstChallenge.type);

  // Oppdater spill med challenges og valgte lag
  const { error } = await supabase
    .from('games')
    .update({
      challenges,
      current_challenge_index: 0,
      challenge_state: 'betting',
      selected_teams: JSON.stringify([teamsToSelect]) // Lagre valgte lag for første challenge
    })
    .eq('id', gameId);
    
  console.log("Starter initializeGame for", gameId);
  console.log("Valgte utfordringer:", challenges);
  console.log("Valgte lag:", teamsToSelect);

  if (error) {
    console.error('Feil ved start:', error.message);
  }

  return { error };
}