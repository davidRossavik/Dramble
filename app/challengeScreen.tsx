import { supabase } from '@/supabase';
import { advanceToNextRound, fetchRunde, isRundeReady, updateRundeState } from '@/utils/rounds';
import { Runde, RundeState } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';
import BettingPhaseView from './stateViews/BettingPhaseView';
import FinishedView from './stateViews/FinishedView';
import GameFinishedView from './stateViews/GameFinishedView';
import PlayingView from './stateViews/PlayingView';

export default function ChallengeScreen() {
  const { gameId } = useLocalSearchParams();
  const [runde, setRunde] = useState<Runde | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [gameStatus, setGameStatus] = useState<string | null>(null);

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

  // Hent game status og initial game state
  useEffect(() => {
    const fetchInitialGame = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('current_challenge_index, status')
          .eq('id', gameId)
          .single();

        if (!error && data) {
          setGameStatus(data.status);
          if (data.status !== 'finished') {
            const newRunde = await fetchRunde(gameId, data.current_challenge_index);
            setRunde(newRunde);
          }
        } else {
          console.error('Feil ved henting av spilldata:', error);
        }
      } catch (error) {
        console.error('Feil ved henting av initial game:', error);
      }
    };
    fetchInitialGame();
  }, [gameId]);

  // Realtime oppdatering for status og runde
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
          try {
            if (payload.new.status !== payload.old?.status) {
              setGameStatus(payload.new.status);
              if (payload.new.status === 'finished') {
                return;
              }
            }
            if (payload.new.status === 'finished') {
              return;
            }
            const newIndex = payload.new.current_challenge_index;
            const oldIndex = payload.old?.current_challenge_index;
            if (oldIndex !== undefined && newIndex !== oldIndex) {
              const newRunde = await fetchRunde(gameId, newIndex);
              setRunde(newRunde);
              return;
            }
            if (payload.new.challenge_state !== payload.old?.challenge_state) {
              const newRunde = await fetchRunde(gameId, newIndex);
              setRunde(newRunde);
              return;
            }
            if (payload.new.challenge_winners !== payload.old?.challenge_winners) {
              return;
            }
            const hasOtherChanges = 
              payload.new.selected_teams !== payload.old?.selected_teams ||
              payload.new.teams !== payload.old?.teams ||
              payload.new.challenges !== payload.old?.challenges;
            if (hasOtherChanges) {
              const newRunde = await fetchRunde(gameId, newIndex);
              setRunde(newRunde);
            }
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

    // Ikke gå videre hvis spillet er ferdig
    if (gameStatus === 'finished') {
      setIsTransitioning(false);
      return;
    }

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
  if (gameStatus !== 'finished' && !isRundeReady(runde, isTransitioning)) {  
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Laster utfordring...</Text>
      </View>
    );
  }

  if (gameStatus === 'finished') {
    return <GameFinishedView gameId={gameId} isHost={isHost} />;
  }

  return (
    <View style={{ flex: 1 }}>
      {runde!.state === 'betting' && (
        <BettingPhaseView
          runde={runde!}
          gameId={gameId}
          isHost={isHost}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
      {runde!.state === 'playing' && (
        <PlayingView
          runde={runde!}
          gameId={gameId}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
      {runde!.state === 'finished' && (
        <FinishedView
          runde={runde!}
          gameId={gameId}
          onNextPhaseRequested={handlePhaseAdvance}
          isTransitioning={isTransitioning}
        />
      )}
    </View>
  );
}
