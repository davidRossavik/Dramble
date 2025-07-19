import { supabase } from '@/supabase';
import { advanceToNextRound, fetchRunde, isRundeReady, updateRundeState } from '@/utils/rounds';
import { Runde, RundeState } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import BettingPhaseView from './stateViews/BettingPhaseView';
import FinishedView from './stateViews/FinishedView';
import PlayingView from './stateViews/PlayingView';

export default function ChallengeScreen() {
  const { gameId } = useLocalSearchParams();
  const [runde, setRunde] = useState<Runde | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

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
    const fetchInitialRunde = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('current_challenge_index')
          .eq('id', gameId)
          .single();

        if (!error && data) {
          const newRunde = await fetchRunde(gameId, data.current_challenge_index);
          setRunde(newRunde);
        } else {
          console.error('Feil ved henting av spilldata:', error);
        }
      } catch (error) {
        console.error('Feil ved henting av initial runde:', error);
      }
    };

    fetchInitialRunde();
  }, [gameId]);

  // Realtime oppdatering - forenklet
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
        async (payload) => {
          // Hent hele runden på nytt når noe endres
          try {
            const newIndex = payload.new.current_challenge_index;
            const newRunde = await fetchRunde(gameId, newIndex);
            setRunde(newRunde);
          } catch (error) {
            console.error('Feil ved oppdatering av runde:', error);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // Enkel oppdatering uten animasjon
  const transitionTo = async (newState: RundeState, challengeIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    try {
      // Hent ny runde
      const newRunde = await fetchRunde(gameId, challengeIndex);
      setRunde(newRunde);
    } catch (error) {
      console.error('Feil ved transition:', error);
    } finally {
      // Sett transition til false etter kort forsinkelse
      setTimeout(() => {
        setIsTransitioning(false);
      }, 100);
    }
  };

  const handlePhaseAdvance = async () => {
    if (isTransitioning || !runde) return;
    setIsTransitioning(true);

    // Host oppdaterer state i DB
    if (isHost) {
      try {
        if (runde.state === 'betting') {
          await updateRundeState(gameId, 'playing');
        } else if (runde.state === 'playing') {
          await updateRundeState(gameId, 'finished');
        } else if (runde.state === 'finished') {
          await advanceToNextRound(gameId);
        }
      } catch (error) {
        console.error('Feil under overgang:', error);
        setIsTransitioning(false);
      }
    }

    // Nå venter vi på at realtime skal oppdatere runde
  };

  // Ikke vis noe mens vi bytter eller laster
  if (!isRundeReady(runde, isTransitioning)) {  
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Laster utfordring...</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {runde!.state === 'betting' && (
        <BettingPhaseView
          challenge={runde!.challenge}
          gameId={gameId}
          challengeIndex={runde!.challengeIndex}
          isHost={isHost}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
      {runde!.state === 'playing' && (
        <PlayingView
          challenge={runde!.challenge}
          gameId={gameId}
          challengeIndex={runde!.challengeIndex}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
      {runde!.state === 'finished' && (
        <FinishedView
          challenge={runde!.challenge}
          gameId={gameId}
          challengeIndex={runde!.challengeIndex}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
    </View>
  );
}
