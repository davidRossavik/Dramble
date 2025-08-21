import Button from '@/components/Button';
import { getGameById } from '@/utils/games';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import AppText from '@/components/AppText';

type Props = {
  runde: Runde;
  gameId: string;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean;
};

export default function FinishedView({ runde, gameId, onNextPhaseRequested, isTransitioning }: Props) {
  const [isHost, setIsHost] = useState(false);
  const [balances, setBalances] = useState<Record<string, number>>({});

  // Sjekk om bruker er host og hent balances
  useEffect(() => {
    AsyncStorage.getItem('isHost').then((hostValue) => {
      setIsHost(hostValue === 'true');
    });

    // Hent oppdaterte balances (kun én gang - balances oppdateres ikke under finished)
    async function fetchBalances() {
      const { data } = await getGameById(gameId);
      if (data && data.balances) {
        setBalances(data.balances);
      }
    }
    fetchBalances();

  }, [gameId]);

  // Ikke vis noen loading states hvis parent er i transition
  if (isTransitioning) {
    return null; // Returner ingenting, la parent håndtere loading
  }

  const getWinnerDisplay = () => {
    if (!runde.winner) return 'Ingen vinner valgt';
    
    switch (runde.challenge.type) {
      case '1v1':
        return `${runde.winner} vant utfordringen`;
      
      case 'Team-vs-Team':
        return `${runde.winner} vant utfordringen`;
      
      case 'Team-vs-itself':
        // For Team-vs-itself viser vi om laget klarte utfordringen
        const teamName = runde.selectedTeams[0]?.teamName || 'Laget';
        return runde.winner === 'Klarer' 
          ? `${teamName} klarte det!`
          : `${teamName} klarte det ikke!`;
      
      default:
        return `${runde.winner}`;
    }
  };

  return (
      <View style={styles.contentContainer}>
        <AppText style={styles.title}>Challenge fullført!</AppText>

        <View style={styles.winnerContainer}>
          <AppText style={styles.winnerLabel}>{getWinnerDisplay()}</AppText>
        </View>

        {/* Vis gøy melding om hvem som må drikke */}
        <View style={styles.drinkingContainer}>
          <AppText style={styles.drinkingTitle}>🍺 Drikke-resultater 🍺</AppText>
          
          {runde.betResults && runde.betResults.length > 0 ? (
            <ScrollView style={styles.scrollViewDrink} showsVerticalScrollIndicator={false}>
            {runde.betResults.map((result, index) => (
              <View key={index} style={styles.drinkingResult}>
                <AppText style={styles.teamName}>{result.teamName}</AppText>
                <AppText style={[
                  styles.drinkingMessage,
                  result.isCorrect ? styles.correctDrinking : styles.incorrectDrinking
                ]}>
                  {result.isCorrect 
                    ? `🎉 Dere kan dele ut ${result.amount} slurker`
                    : `😅 OOPS! Drikk ${result.amount} slurker`
                  }
                </AppText>
              </View>
            ))}
            </ScrollView>
          ) : (
            <AppText style={styles.noBets}>🍺 Ingen veddemål ble plassert denne runden - alle slipper unna! </AppText>
          )}
          
        </View>

        {/* Vis oppdaterte balances */}
        <View style={styles.balancesContainer}>
          <AppText style={styles.balancesTitle}>💰 Oppdatert Slurkebank 💰</AppText>
          <ScrollView style={styles.scrollViewBank} showsVerticalScrollIndicator={false}>
          {Object.entries(balances).map(([teamName, balance]) => (
            <View key={teamName} style={styles.balanceItem}>
              <AppText style={styles.teamName}>{teamName}</AppText>
              <AppText style={styles.balanceText}>{balance} slurker</AppText>
            </View>
          ))}
          </ScrollView>
        </View>

        {isHost && (
          <Button
            label="Neste runde"
            onPress={onNextPhaseRequested}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
          />
        )}
      </View>
  );
}

const styles = StyleSheet.create({
  // TEXT //
  title: {
    fontSize: 35,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  winnerLabel: {
    fontSize: 18,
    // fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#D49712',
    fontWeight: 'bold'
  },
  drinkingTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  drinkingMessage: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  correctDrinking: {
    color: '#4CAF50',
  },
  incorrectDrinking: {
    color: '#F44336',
  },
  noBets: {
    fontSize: 20,
    textAlign: 'center',
    color: '#FAF0DE',
    fontStyle: 'italic',
  },
  balancesTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 5,
  },
  nextButtonText: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  // TEXT //


  contentContainer: {
    padding: 20,
    paddingBottom: 40,
    marginTop: 60
  },
  winnerContainer: {
    marginBottom: 20,
  },
  
  balancesContainer: {
    marginBottom: 30,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  drinkingContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderColor: '#D49712',
    borderWidth: 2,
  },
  drinkingResult: {
    marginBottom: 10,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderColor: '#D49712',
    borderWidth: 1,

  },

  scrollViewDrink: {
    height: 180
  },
  scrollViewBank: {
    height: 160,
  },

  nextButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
});
