import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, View } from 'react-native';

import BackgroundWrapper from '@/components/BackgroundWrapper';
import { MinigameResult, MinigameType, getMinigameDisplayName } from '@/utils/minigames';
import { supabase } from '../supabase-functions/supabase.js';

// Import minigame components
import Flaks from './vinn-slurker/flaks';
import RouletteGame from './vinn-slurker/rouletteGame';
import SpinTheWheel from './vinn-slurker/spinTheWheel';
import UpOrDownGame from './vinn-slurker/upOrDownGame';

interface MinigameProps {
  onComplete: (result: MinigameResult) => void;
  gameId: string;
  challengeIndex: number;
  playerName?: string;
  teamName?: string;
}

export default function MinigameWrapper() {
  const { type, gameId, challengeIndex, playerName, teamName } = useLocalSearchParams<{
    type: string;
    gameId: string;
    challengeIndex: string;
    playerName?: string;
    teamName?: string;
  }>();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!type || !gameId || !challengeIndex) {
      Alert.alert('Feil', 'Manglende parametre for minigame');
      router.back();
      return;
    }
    setIsLoading(false);
  }, [type, gameId, challengeIndex]);

  const handleMinigameComplete = async (result: MinigameResult) => {
    try {
      // Lagre resultat i database
      const { error } = await supabase
        .from('games')
        .update({
          minigame_triggered: true,
          minigame_type: result.type,
          minigame_results: result,
        })
        .eq('id', gameId);

      if (error) {
        console.error('Feil ved lagring av minigame resultat:', error);
        Alert.alert('Feil', 'Kunne ikke lagre minigame resultat');
      } else {
        // Vis resultat til brukeren
        const message = result.won 
          ? `Gratulerer! Du vant ${result.slurksGained} slurker!`
          : `Beklager! Du mistet ${result.slurksLost} slurker.`;
        
        Alert.alert(
          getMinigameDisplayName(result.type as MinigameType),
          message,
          [
            {
              text: 'OK',
              onPress: () => {
                // Gå tilbake til hovedspill
                router.back();
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('Feil ved håndtering av minigame resultat:', error);
      Alert.alert('Feil', 'Noe gikk galt');
      router.back();
    }
  };

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Laster minigame...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

  const minigameType = type as MinigameType;
  const props: MinigameProps = {
    onComplete: handleMinigameComplete,
    gameId,
    challengeIndex: parseInt(challengeIndex),
    playerName,
    teamName,
  };

  // Render riktig minigame basert på type
  switch (minigameType) {
    case 'flaks':
      return <Flaks {...props} />;
    case 'spinTheWheel':
      return <SpinTheWheel {...props} />;
    case 'roulette':
      return <RouletteGame {...props} />;
    case 'upOrDown':
      return <UpOrDownGame {...props} />;
    default:
      return (
        <BackgroundWrapper>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Ukjent minigame type: {type}</Text>
          </View>
        </BackgroundWrapper>
      );
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FAF0DE',
    fontSize: 18,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    color: '#FAF0DE',
    fontSize: 18,
  },
}); 