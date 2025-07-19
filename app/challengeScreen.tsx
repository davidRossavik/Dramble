import { supabase } from '@/supabase';
import { Challenge } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import BettingPhaseView from './stateViews/BettingPhaseView';
import FinishedView from './stateViews/FinishedView';
import PlayingView from './stateViews/PlayingView';

type ChallengeState = 'betting' | 'playing' | 'finished';

export default function ChallengeScreen() {
  const { gameId } = useLocalSearchParams();
  const [displayState, setDisplayState] = useState<ChallengeState>('betting');
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [challengeIndex, setChallengeIndex] = useState<number>(0);

  if (typeof gameId !== 'string') {
    return <Text>Invalid game ID</Text>;
  }

  // Hent ut om brukeren er host
  useEffect(() => {
    const checkHostStatus = async () => {
      const value = await AsyncStorage.getItem('isHost');
      setIsHost(value === 'true');
    };
    checkHostStatus();
  }, []);

  // Initial game state
  useEffect(() => {
    const fetchInitialGameState = async () => {
      const { data, error } = await supabase
        .from('games')
        .select('challenge_state, current_challenge_index, challenges')
        .eq('id', gameId)
        .single();

      if (!error && data) {
        const newChallenge = data.challenges?.[data.current_challenge_index];
        if (newChallenge) {
          transitionTo(data.challenge_state, newChallenge, data.current_challenge_index);
        }
      } else {
        console.error('Feil ved henting av spilldata:', error);
      }
    };

    fetchInitialGameState();
  }, [gameId]);

  // Realtime oppdatering
  useEffect(() => {
    const channel = supabase
      .channel(`game-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          const newState: ChallengeState = payload.new.challenge_state;
          const oldState: ChallengeState = payload.old.challenge_state;
          const newIndex = payload.new.current_challenge_index;
          const oldIndex = payload.old.current_challenge_index;
          const challenges = payload.new.challenges;

          // Kjør kun hvis state eller index faktisk har endret seg
          if (newState !== oldState || newIndex !== oldIndex) {
            if (challenges && challenges[newIndex]) {
              const nextChallenge = challenges[newIndex];
              transitionTo(newState, nextChallenge, newIndex);
            } else {
              console.warn('Ingen challenge funnet for index:', newIndex);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // Enkel oppdatering uten animasjon
  const transitionTo = (newState: ChallengeState, newChallenge: Challenge, index: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Oppdater challenge og state umiddelbart
    setChallenge(newChallenge);
    setChallengeIndex(index);
    setDisplayState(newState);

    // Sett transition til false etter kort forsinkelse
    setTimeout(() => {
      setIsTransitioning(false);
    }, 100);
  };

  const handlePhaseAdvance = async () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    // Host oppdaterer state i DB
    if (isHost) {
      try {
        if (displayState === 'betting') {
          await supabase.from('games').update({ challenge_state: 'playing' }).eq('id', gameId);
        } else if (displayState === 'playing') {
          await supabase.from('games').update({ challenge_state: 'finished' }).eq('id', gameId);
        } else if (displayState === 'finished') {
          const { data, error: rpcError } = await supabase.rpc('increment_index', { gid: gameId });
          if (rpcError || typeof data !== 'number') {
            console.error('Feil ved RPC:', rpcError);
            return;
          }

          const { error: updateError } = await supabase
            .from('games')
            .update({
              challenge_state: 'betting',
              current_challenge_index: data,
            })
            .eq('id', gameId);

          if (updateError) {
            console.error('Feil ved oppdatering til neste challenge:', updateError);
          }
        }
      } catch (error) {
        console.error('Feil under overgang:', error);
      }
    }

    // Nå venter vi på at realtime skal kalle transitionTo()
  };

  // Ikke vis noe mens vi bytter eller laster
  if (!challenge || isTransitioning) {  
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Laster utfordring...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {displayState === 'betting' && (
        <BettingPhaseView
          challenge={challenge}
          gameId={gameId}
          challengeIndex={challengeIndex}
          isHost={isHost}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
      {displayState === 'playing' && (
        <PlayingView
          challenge={challenge}
          gameId={gameId}
          challengeIndex={challengeIndex}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
      {displayState === 'finished' && (
        <FinishedView
          challenge={challenge}
          gameId={gameId}
          challengeIndex={challengeIndex}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
    </View>
  );
}
