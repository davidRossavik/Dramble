import { supabase } from '@/supabase';
import { Challenge } from '@/utils/types'; // hvis du har laget typen Challenge
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text } from 'react-native';
import BettingPhaseView from './stateViews/BettingPhaseView';
import FinishedView from './stateViews/FinishedView';
import PlayingView from './stateViews/PlayingView';


export default function ChallengeScreen() {
  const { challenge: challengeParam, gameId } = useLocalSearchParams();
  const router = useRouter();
  const [challengeState, setChallengeState] = useState<'betting' | 'playing' | 'finished'>('betting');
  const [isHost, setIsHost] = useState(false);


  if (typeof challengeParam !== 'string') {
    return <Text>Ugyldig challenge-data</Text>;
  }

  if (typeof gameId !== 'string') {
    return <Text>Ugyldig challenge-data</Text>;
  }

  useEffect(() => {
  const getHostStatus = async () => {
    const value = await AsyncStorage.getItem('isHost');
    setIsHost(value === 'true');
  };

  getHostStatus();
  }, []);
  
  let parsedChallenge: Challenge;
  try {
    parsedChallenge = JSON.parse(challengeParam);
  } catch (err) {
    return <Text>Feil i challenge-formatet</Text>;
  }


  //henter og sette challenge staten
  useEffect(() => {
  const fetchChallengeState = async () => {
    const { data, error } = await supabase
      .from('games')
      .select('challenge_state')
      .eq('id', gameId)
      .single();

    if (!error && data) {
      setChallengeState(data.challenge_state);
    }
  };

    if (gameId) fetchChallengeState();
  }, [gameId]);



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
            const newstate = payload.new.challenge_state;

            if (newstate) {
                setChallengeState(newstate);
            }

            if (oldindex === newindex) {
                return;
            }
            
            const { data, error } = await supabase
              .from('games')
              .select('challenges')
              .eq('id', gameId)
              .single();

            if (error || !data) {
              console.error("Feil ved henting av challenges:", error);
              return;
            }

            const freshChallenges = data.challenges;
            const nextChallenge = freshChallenges[newindex];

            if (!nextChallenge) return;

            router.replace({
                pathname: './challengeScreen',
                params: {
                  challenge: JSON.stringify(nextChallenge),
                  gameId: gameId.toString(),
                },
            });
            }
        )
        .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [gameId]);



if (challengeState === 'betting') {
  return (
    <BettingPhaseView
      challenge={parsedChallenge}
      gameId={gameId}
      isHost={isHost}
    />
  );
}


if (challengeState === 'playing') {
  return <PlayingView challenge={parsedChallenge} gameId={gameId} />;
}


if (challengeState === 'finished') {
  return <FinishedView challenge={parsedChallenge} gameId={gameId} />;
}


return <Text>Laster...</Text>;

}
