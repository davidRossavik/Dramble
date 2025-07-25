import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { getGameById } from '@/utils/games';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../supabase';

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
    AsyncStorage.getItem('playerName').then((name) => {
      setIsHost(name === 'Host');
    });

    // Hent oppdaterte balances
    async function fetchBalances() {
      const { data } = await getGameById(gameId);
      if (data && data.balances) {
        setBalances(data.balances);
      }
    }
    fetchBalances();

    // Sett opp real-time listener for balance oppdateringer
    const channel = supabase
      .channel(`balances-finished-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload: any) => {
          if (payload.new.balances) {
            setBalances(payload.new.balances);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId]);

  // Ikke vis noen loading states hvis parent er i transition
  if (isTransitioning) {
    return null; // Returner ingenting, la parent håndtere loading
  }

  const getChallengeDescription = () => {
    switch (runde.challenge.type) {
      case '1v1':
        const [player1, player2] = runde.challenge.participants || ['Spiller 1', 'Spiller 2'];
        return `${player1} vs ${player2}: ${runde.challenge.description}`;
      
      case 'Team-vs-Team':
        const team1 = runde.selectedTeams[0]?.teamName || 'Lag 1';
        const team2 = runde.selectedTeams[1]?.teamName || 'Lag 2';
        return `${team1} vs ${team2}: ${runde.challenge.description}`;
      
      case 'Team-vs-itself':
        // For Team-vs-itself skal to spillere fra forskjellige lag utføre utfordringen sammen
        const team1Name = runde.selectedTeams[0]?.teamName || 'Lag 1';
        const team2Name = runde.selectedTeams[1]?.teamName || 'Lag 2';
        return `${team1Name} og ${team2Name} skal sammen: ${runde.challenge.description}`;
      
      default:
        return runde.challenge.description;
    }
  };

  const getWinnerDisplay = () => {
    if (!runde.winner) return 'Ingen vinner valgt';
    
    switch (runde.challenge.type) {
      case '1v1':
        return `${runde.winner} vant!`;
      
      case 'Team-vs-Team':
        return `${runde.winner} vant!`;
      
      case 'Team-vs-itself':
        // For Team-vs-itself viser vi om de to spillerne klarte utfordringen sammen
        const team1Name = runde.selectedTeams[0]?.teamName || 'Lag 1';
        const team2Name = runde.selectedTeams[1]?.teamName || 'Lag 2';
        return runde.winner === 'Klarer' 
          ? `${team1Name} og ${team2Name} klarte det sammen!`
          : `${team1Name} og ${team2Name} klarte det ikke sammen!`;
      
      default:
        return `${runde.winner} vant!`;
    }
  };

  return (
    <BackgroundWrapper>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Challenge fullført!</Text>
        
        <View style={styles.challengeContainer}>
          <Text style={styles.description}>{getChallengeDescription()}</Text>
        </View>

        <View style={styles.winnerContainer}>
          <Text style={styles.winnerLabel}>Vinner:</Text>
          <Text style={styles.winnerText}>{getWinnerDisplay()}</Text>
        </View>

        {/* Vis gøy melding om hvem som må drikke */}
        <View style={styles.drinkingContainer}>
          <Text style={styles.drinkingTitle}>🍺 Drikke-resultater 🍺</Text>
          
          {runde.betResults && runde.betResults.length > 0 ? (
            runde.betResults.map((result, index) => (
              <View key={index} style={styles.drinkingResult}>
                <Text style={styles.teamName}>{result.teamName}</Text>
                <Text style={[
                  styles.drinkingMessage,
                  result.isCorrect ? styles.correctDrinking : styles.incorrectDrinking
                ]}>
                  {result.isCorrect 
                    ? `🎉 GRATULERER! Dere kan dele ut ${result.amount} slurker til andre! 🎉`
                    : `😅 OOPS! Dere må drikke ${result.amount} slurker selv! 😅`
                  }
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noBets}>🍺 Ingen veddemål ble plassert denne runden - alle slipper unna! 🍺</Text>
          )}
        </View>

        {/* Vis oppdaterte balances */}
        <View style={styles.balancesContainer}>
          <Text style={styles.balancesTitle}>💰 Nye balances etter runde:</Text>
          {Object.entries(balances).map(([teamName, balance]) => (
            <View key={teamName} style={styles.balanceItem}>
              <Text style={styles.teamName}>{teamName}</Text>
              <Text style={styles.balanceText}>{balance} slurker</Text>
            </View>
          ))}
        </View>

        {isHost && (
          <Button
            label="Neste runde"
            onPress={onNextPhaseRequested}
            style={styles.nextButton}
            textStyle={styles.nextButtonText}
          />
        )}
      </ScrollView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 30,
  },
  challengeContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FAF0DE',
    lineHeight: 22,
  },
  winnerContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  winnerLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF4500',
    marginBottom: 10,
  },
  winnerText: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF4500',
  },
  noBets: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FAF0DE',
    fontStyle: 'italic',
  },
  balancesContainer: {
    marginBottom: 30,
  },
  balancesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  balanceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  balanceText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
  },
  drinkingContainer: {
    marginBottom: 30,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
  },
  drinkingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  drinkingResult: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
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
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 5,
  },
  nextButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});
