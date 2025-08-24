import BackgroundWrapper from '@/components/BackgroundWrapper';
import { advanceToNextRound, fetchBettingToPlaying, fetchNewRound, fetchPlayingToFinished, fetchRunde, updateRundeState } from '@/utils/rounds';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
import { supabase } from '../supabase-functions/supabase.js';
import BettingPhaseView from './stateViews/BettingPhaseView';
import FinishedView from './stateViews/FinishedView';
import GameFinishedView from './stateViews/GameFinishedView';
import PlayingView from './stateViews/PlayingView';

export default function ChallengeScreen() {
  const router = useRouter();
  const { gameId, code } = useLocalSearchParams();
  const [runde, setRunde] = useState<Runde | null>(null);
  const [isHost, setIsHost] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [gameStatus, setGameStatus] = useState<string | null>(null);
  const [balances, setBalances] = useState<Record<string,number>>({});
  // Animasjon (fade)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeIn = useCallback(() => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);
  
  const fadeOut = () => {
    return new Promise((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(({finished}) => {
     
        resolve(true);});
    });
  };

  useEffect(() => {
    if (runde) {
      fadeIn();
    }
  }, [runde?.state, fadeIn]);

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
    if (typeof gameId !== 'string') return;
    
    const fetchInitialGame = async () => {
      try {
        const { data, error } = await supabase
          .from('games')
          .select('current_challenge_index, status, challenge_state, balances')
          .eq('id', gameId)
          .single();

        if (!error && data) {
          setGameStatus(data.status);
          setBalances(data.balances || {});
          if (data.status !== 'finished') {
            const newRunde = await fetchRunde(gameId, data.current_challenge_index, 'initial');
            setRunde(newRunde);
          }
        } else {
          console.error('Feil ved henting av spilldata:', error);
        }
      } catch (error) {
        console.error('Feil ved henting av initial game:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialGame();
  }, [gameId]);

  // Realtime oppdatering for status og runde
  useEffect(() => {
    if (typeof gameId !== 'string') return;
    
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
                setRunde(null);
                setIsTransitioning(false);
                return;
              }
              if (payload.new.status === 'waiting') {
                const storedCode = await AsyncStorage.getItem('gameCode');
                if (storedCode) {
                  router.replace({ pathname: '/startGame', params: { code: storedCode } });
                } else {
                  const { data } = await supabase
                    .from('games')
                    .select('code')
                    .eq('id', gameId)
                    .single();
                  if (data?.code) {
                    router.replace({ pathname: '/startGame', params: { code: data.code } });
                  }
                }
                return;
              }
            }

            const newIndex = payload.new.current_challenge_index;
            const oldIndex = payload.old?.current_challenge_index;
            const newState = payload.new.challenge_state;
            const oldState = payload.old?.challenge_state;

            if (payload.new?.balances && payload.new.balances !== payload.old?.balances) {
              setBalances(payload.new.balances);
            }
            
            // Index endres (ny runde)
            if (oldIndex !== undefined && newIndex !== oldIndex) {
              // Legg til delay for å unngå race conditions
              setTimeout(async () => {
                const newRunde = await fetchNewRound(gameId, newIndex);
                setRunde(newRunde);
                setIsTransitioning(false);
              }, 100);
              return;
            }
            
            // State endres (samme runde)
            if (newState !== oldState) {
              let newRunde: Runde | null = null;
              
              if (oldState === 'betting' && newState === 'playing') {
                newRunde = await fetchBettingToPlaying(gameId, newIndex);
              } else if (oldState === 'playing' && newState === 'finished') {
                newRunde = await fetchPlayingToFinished(gameId, newIndex);
              } else {
                // Fallback til full fetchRunde for andre tilstander
                newRunde = await fetchRunde(gameId, newIndex, 'state');
              }
              
              setRunde(newRunde);
              setIsTransitioning(false);
              return;
            }

          } catch (error) {
            console.error('Feil ved oppdatering av runde:', error);
            setIsTransitioning(false);
          }
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, router]);

  if (typeof gameId !== 'string') {
    return (
    <BackgroundWrapper>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text>Invalid game ID</Text>
      </View>
    </BackgroundWrapper>
    )
  }
  
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
          // Sjekk om dette er siste runde
          const { data: gameData, error: gameError } = await supabase
            .from('games')
            .select('challenges, current_challenge_index')
            .eq('id', gameId)
            .single();
            
          if (gameError || !gameData) {
            setIsTransitioning(false);
            return;
          }
          
          const challenges = gameData.challenges || [];
          const currentIndex = gameData.current_challenge_index;
          const isLastRound = currentIndex >= challenges.length - 1;
          
          if (isLastRound) {
            // Sett status til finished direkte for å unngå race condition
            await supabase
              .from('games')
              .update({ status: 'finished' })
              .eq('id', gameId);
            // Ikke sett isTransitioning til false her - la realtime listener håndtere det
            return;
          } else {
            await advanceToNextRound(gameId);
          }
        }
      } catch (error) {
        console.error('Feil under overgang:', error);
        setIsTransitioning(false);
      }
    } else {
      setIsTransitioning(false);
    }
  };

  if (gameStatus === 'finished') {
    return (
      <GameFinishedView gameId={gameId} isHost={isHost} />
    );
  }

  return (
    <BackgroundWrapper>
      <View style={{flex: 1}}>

        {/* Hovedinnhold med fade */}
        {!isLoading && runde && (
          <Animated.View style={{flex: 1, opacity: fadeAnim }}>
            {runde!.state === 'betting' && (
              <BettingPhaseView
                runde={runde!}
                gameId={gameId}
                isHost={isHost}
                onNextPhaseRequested={handlePhaseAdvance}
                isTransitioning={isTransitioning}
                balances={balances}
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
          </Animated.View>
        )}

        {/* Debug info */}
        {!isLoading && !runde && (
          <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
            <Text style={{color: 'white'}}>Ingen runde data tilgjengelig</Text>
            <Text style={{color: 'white'}}>Game Status: {gameStatus}</Text>
            <Text style={{color: 'white'}}>Is Transitioning: {isTransitioning.toString()}</Text>
          </View>
        )}

      </View>
    </BackgroundWrapper>
  );
}
