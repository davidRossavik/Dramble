import BackgroundWrapper from '@/components/BackgroundWrapper';
import { supabase } from '@/supabase';
import { advanceToNextRound, fetchRunde, updateRundeState } from '@/utils/rounds';
import { Runde, RundeState } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Text, View } from 'react-native';
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

  // Animasjon (fade)
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const fadeIn = () => {
  return new Promise((resolve) => {
    fadeAnim.setValue(0);
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(({ finished }) => {
      resolve(true);
    });
  });
};
  
  const fadeOut = () => {
    return new Promise((resolve) => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 2000,
        useNativeDriver: true,
      }).start(({finished}) => {
        console.log('FadeOut completed:', finished);
        resolve(true);});
    });
  };

  useEffect(() => {
    if (runde) {
      fadeIn();
    }
  }, [runde?.state]);
  // Animasjon

  if (typeof gameId !== 'string') {
    return (
    <BackgroundWrapper>
      <View style={{justifyContent: 'center', alignItems: 'center'}}>
        <Text>Invalid game ID</Text>
      </View>
    </BackgroundWrapper>
    )
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
          .select('current_challenge_index, status, challenge_state')
          .eq('id', gameId)
          .single();
        
        

        if (!error && data) {
          setGameStatus(data.status);
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
                return; //gjør ingenting når spillet er ferdig, da har vi allerede sett på GameFinishedView
              }
              if (payload.new.status === 'waiting') {
                const gameCode = code;
                router.replace({ pathname: '/startGame', params: { code: gameCode } });
                return;
              }
            }

            const newIndex = payload.new.current_challenge_index;
            const oldIndex = payload.old?.current_challenge_index;
            if (oldIndex !== undefined && newIndex !== oldIndex) {
              const newRunde = await fetchRunde(gameId, newIndex, 'index');
              setRunde(newRunde);
              return; //setter ny runde når index endrer seg
            }
            if (payload.new.challenge_state !== payload.old?.challenge_state) {
              const newRunde = await fetchRunde(gameId, newIndex, 'state');
              setRunde(newRunde);
              return; //setter ny runde når state endrer seg
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
  }, [gameId]);

  // Enkel oppdatering uten animasjon
  const transitionTo = async (newState: RundeState, challengeIndex: number) => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    try {
      // Hent ny runde
      const newRunde = await fetchRunde(gameId, challengeIndex, 'transition');
      setRunde(newRunde);
    } catch (error) {
      console.error('Feil ved transition:', error);
    } 
  };
  
  const handlePhaseAdvance = async () => {
    console.log('handlePhaseAdvance');
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

  if (gameStatus === 'finished') {
    return <GameFinishedView gameId={gameId} isHost={isHost} />;
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

      </View>
    </BackgroundWrapper>
  );
}
