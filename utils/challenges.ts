import challenges from '@/assets/data/challenges.json';
import { supabase } from '@/supabase';
import { Challenge, Team } from './types';

export async function getRandomChallengesWithPlayers(gameId: string, n: number = 10): Promise<Challenge[]> {
  const base = getRandomChallenges(n) as Challenge[];

  const updated = await Promise.all(
    base.map(async (challenge) => {
      if (challenge.type === '1v1') {
        const players = await getRandomPlayersFromGame(gameId, 2);
        return {... challenge, participants: players};
      }
      return {... challenge, participants: undefined};
    })
  );

  return updated;
}


// getRandomChallenges og getRandomPLayersfromGame er nå hjelpefunksjoner til den over!

export function getRandomChallenges(n: number) {
  const filtered = challenges.filter(c => c.title && c.description);
  const shuffled = shuffleArray(filtered); // Shuffle med Fisher–Yates
  return shuffled.slice(0, n);
}

export async function getRandomPlayersFromGame(gameId: string, count = 2): Promise<string[]> {
  const { data, error } = await supabase.from('games').select('teams').eq('id', gameId).single();

  if (error || !data) {
    console.error('Feil ved henting av teams: ', error);
    return [];
  }

  const allPlayers: string[] = (data.teams as Team[])
    .flatMap(team => team.players.map(player => player.name));
  
  if (allPlayers.length < count) {
    console.warn(`Kun ${allPlayers.length} spillere tilgjengelig, men ${count} ønsket`);
    return allPlayers;
  }

  const shuffled = shuffleArray(allPlayers);
  return shuffled.slice(0, count); // tar ut antallet vi ba om (2)
}

// Fisher-Yates Shuffling
function shuffleArray<T>(array: T[]): T[] {
  const copy = [... array];

  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}