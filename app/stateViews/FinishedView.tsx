import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  runde: Runde;
  gameId: string;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean;
};

export default function FinishedView({ runde, gameId, onNextPhaseRequested, isTransitioning }: Props) {
  const [isHost, setIsHost] = useState(false);

  // Sjekk om bruker er host
  useEffect(() => {
    AsyncStorage.getItem('playerName').then((name) => {
      setIsHost(name === 'Host');
    });
  }, []);

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
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Challenge fullført!</Text>
        
        <View style={styles.challengeContainer}>
          <Text style={styles.description}>{getChallengeDescription()}</Text>
        </View>

        <View style={styles.winnerContainer}>
          <Text style={styles.winnerLabel}>Vinner:</Text>
          <Text style={styles.winnerText}>{getWinnerDisplay()}</Text>
        </View>

        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>Betting-resultater:</Text>
          
          {runde.betResults.length > 0 ? (
            runde.betResults.map((result, index) => (
              <View key={index} style={styles.betResult}>
                <Text style={styles.teamName}>{result.teamName}</Text>
                <Text style={styles.betInfo}>
                  Veddet {result.amount} slurker på "{result.betOn}"
                </Text>
                <Text style={[
                  styles.resultText,
                  result.isCorrect ? styles.correctBet : styles.incorrectBet
                ]}>
                  {result.isCorrect ? '✅ Riktig!' : '❌ Feil!'} 
                  {result.delta > 0 ? ` +${result.delta}` : ` ${result.delta}`} slurker
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noBets}>Ingen betting-resultater tilgjengelig</Text>
          )}
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
  container: {
    flex: 1,
  },
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
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
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
  resultsContainer: {
    marginBottom: 30,
  },
  resultsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  betResult: {
    marginBottom: 15,
    padding: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  teamName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 5,
  },
  betInfo: {
    fontSize: 14,
    color: '#FAF0DE',
    marginBottom: 5,
  },
  resultText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  correctBet: {
    color: '#4CAF50',
  },
  incorrectBet: {
    color: '#F44336',
  },
  noBets: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FAF0DE',
    fontStyle: 'italic',
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
