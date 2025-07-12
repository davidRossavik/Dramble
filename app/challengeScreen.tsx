import { supabase } from '@/supabase';
import { Challenge } from '@/utils/types'; // hvis du har laget typen Challenge
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect } from 'react';
import { Text } from 'react-native';
import OneVsOne from './challengetypes/OneVsOne';
import TeamVsItself from './challengetypes/TeamVsItself';
import TeamVsTeam from './challengetypes/TeamVsTeam';

export default function ChallengeScreen() {
  const { challenge: challengeParam, gameId } = useLocalSearchParams();
  const router = useRouter();

  if (typeof challengeParam !== 'string') {
    return <Text>Ugyldig challenge-data</Text>;
  }

  let parsedChallenge: Challenge;
  try {
    parsedChallenge = JSON.parse(challengeParam);
  } catch (err) {
    return <Text>Feil i challenge-formatet</Text>;
  }


  // følger med på endring av current_challenge_index og kjører ny challenge skjerm når index oppdateres
  useEffect(() => {
    if (!gameId || typeof gameId !== 'string') return;

    const channel = supabase
      .channel(`game-progress-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
            const oldindex = payload.old.current_challenge_index;
            const newindex = payload.new.current_challenge_index;

            if (oldindex === newindex) {
                return;
            }
            
            const challenges = payload.new.challenges;
            const nextChallenge = challenges[newindex];

            if (!nextChallenge) return;

            router.replace({
                pathname: '/challengeScreen',
                params: {
                  challenge: JSON.stringify(nextChallenge),
                  gameId,
                },
            });
            }
        )
        .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId]);



  switch (parsedChallenge.type) {
    case '1v1':
      return <OneVsOne challenge={parsedChallenge} />;
    case 'Team-vs-Team':
      return <TeamVsTeam challenge={parsedChallenge} />;
    case 'Team-vs-itself':
      return <TeamVsItself challenge={parsedChallenge} />;
    default:
      return <Text>Ukjent challenge-type: {parsedChallenge.type}</Text>;
  }
}
