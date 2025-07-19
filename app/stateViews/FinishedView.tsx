import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { getBettingResults, resolveBet } from '@/utils/bets';
import { getSelectedTeamsForChallenge, getWinnerForChallenge } from '@/utils/games';
import { Challenge, Team } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  challengeIndex: number;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean; // Ny prop for å vite om parent er i transition
};

type BetResult = {
  teamName: string;
  betOn: string;
  amount: number;
  isCorrect: boolean;
  delta: number;
};

export default function FinishedView({ challenge, gameId, challengeIndex, onNextPhaseRequested, isTransitioning }: Props) {
  const [isHost, setIsHost] = useState(false);
  const [winner, setWinner] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [betResults, setBetResults] = useState<BetResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [slurksUpdated, setSlurksUpdated] = useState(false);

  // Hent data og oppdater slurker
  useEffect(() => {
    const fetchDataAndResolveBets = async () => {
      setIsLoading(true);
      
      // Sjekk om bruker er host
      const playerName = await AsyncStorage.getItem('playerName');
      setIsHost(playerName === 'Host');

      // Hent valgte teams
      const teams = await getSelectedTeamsForChallenge(gameId, challengeIndex);
      setSelectedTeams(teams);

      // Hent vinner
      const challengeWinner = await getWinnerForChallenge(gameId, challengeIndex);
      setWinner(challengeWinner);

      if (challengeWinner && !slurksUpdated) {
        // Oppdater slurker basert på betting-resultater
        await resolveBet(gameId, challengeIndex, challengeWinner);
        setSlurksUpdated(true);
      }

      // Hent og vis betting-resultater
      if (challengeWinner) {
        const results = await getBettingResults(gameId, challengeIndex, challengeWinner);
        setBetResults(results);
      }
      
      setIsLoading(false);
    };

    fetchDataAndResolveBets();
  }, [gameId, challengeIndex, slurksUpdated]);

  const getChallengeDescription = () => {
    const performingTeam = selectedTeams[0];
    
    switch (challenge.type) {
      case '1v1':
        const [player1, player2] = challenge.participants || ['Spiller 1', 'Spiller 2'];
        return `${player1} vs ${player2}: ${challenge.description}`;
      
      case 'Team-vs-Team':
        const team1 = selectedTeams[0]?.teamName || 'Lag 1';
        const team2 = selectedTeams[1]?.teamName || 'Lag 2';
        return `${team1} vs ${team2}: ${challenge.description}`;
      
      case 'Team-vs-itself':
        return `${performingTeam?.teamName || 'Laget'} skal: ${challenge.description}`;
      
      default:
        return challenge.description;
    }
  };

  const getWinnerDisplay = () => {
    if (!winner) return 'Ingen vinner valgt';
    
    switch (challenge.type) {
      case '1v1':
        return `${winner} vant!`;
      
      case 'Team-vs-Team':
        return `${winner} vant!`;
      
      case 'Team-vs-itself':
        return winner === 'Klarer' 
          ? `${selectedTeams[0]?.teamName || 'Laget'} klarte det!`
          : `${selectedTeams[0]?.teamName || 'Laget'} klarte det ikke!`;
      
      default:
        return `${winner} vant!`;
    }
  };

  // Ikke vis noen loading states hvis parent er i transition
  if (isTransitioning) {
    return null; // Returner ingenting, la parent håndtere loading
  }

  if (isLoading) {
    return (
      <BackgroundWrapper>
        <View style={styles.container}>
          <Text style={styles.title}>Laster resultater...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

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
          
          {betResults.length > 0 ? (
            betResults.map((result, index) => (
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
    fontSize: 16,
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
    fontSize: 18,
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
    alignSelf: 'center',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
});
