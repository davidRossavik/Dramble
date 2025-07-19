import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { setWinnerForChallenge } from '@/utils/games';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  runde: Runde;
  gameId: string;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean;
};

export default function PlayingView({ runde, gameId, onNextPhaseRequested, isTransitioning }: Props) {
  const [localSelectedWinner, setLocalSelectedWinner] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);

  // Sjekk om bruker er host
  useEffect(() => {
    AsyncStorage.getItem('playerName').then((name) => {
      setIsHost(name === 'Host');
    });
  }, []);

  // Bruk runde.winner som fallback hvis ingen lokal valg er gjort
  const selectedWinner = localSelectedWinner || runde.winner;

  // Ikke vis noen loading states hvis parent er i transition
  if (isTransitioning) {
    return null; // Returner ingenting, la parent håndtere loading
  }

  const getWinnerOptions = () => {
    switch (runde.challenge.type) {
      case '1v1':
        // For 1v1 bruker vi spiller-navnene fra challenge
        return runde.challenge.participants || ['Spiller 1', 'Spiller 2'];
      
      case 'Team-vs-Team':
        // For Team-vs-Team bruker vi lagnavnene
        return runde.selectedTeams.map(team => team.teamName);
      
      case 'Team-vs-itself':
        // For Team-vs-itself er det "Klarer" eller "Klarer ikke"
        return ['Klarer', 'Klarer ikke'];
      
      default:
        return [];
    }
  };

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

  const handleWinnerSelection = async (winner: string) => {
    // Sett lokal valg umiddelbart for visuell feedback
    setLocalSelectedWinner(winner);
    
    // Lagre vinner i databasen for å synkronisere med andre brukere
    if (isHost) {
      try {
        const { error } = await setWinnerForChallenge(gameId, runde.challengeIndex, winner);
        if (error) {
          console.error('Feil ved lagring av vinner:', error);
          alert('Feil ved lagring av vinner. Prøv igjen.');
          // Tilbakestill lokal valg hvis lagring feilet
          setLocalSelectedWinner(null);
        }
      } catch (error) {
        console.error('Uventet feil ved lagring av vinner:', error);
        alert('Uventet feil ved lagring av vinner. Prøv igjen.');
        // Tilbakestill lokal valg hvis lagring feilet
        setLocalSelectedWinner(null);
      }
    }
  };

  const winnerOptions = getWinnerOptions();

  return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Challenge pågår!</Text>
        
        <View style={styles.challengeContainer}>
          <Text style={styles.description}>{getChallengeDescription()}</Text>
        </View>

        {isHost ? (
          <>
            <View style={styles.buttons}>
              {winnerOptions.map((option, index) => (
                <Button
                  key={index}
                  label={option}
                  onPress={() => handleWinnerSelection(option)}
                  style={[
                    styles.button,
                    selectedWinner === option ? styles.selectedButton : {}
                  ]}
                  textStyle={[
                    styles.buttonText,
                    selectedWinner === option ? styles.selectedButtonText : {}
                  ]}
                />
              ))}
            </View>

            <Button
              label="Neste fase"
              onPress={() => {
                if (selectedWinner) {
                  onNextPhaseRequested();
                } else {
                  alert('Du må velge en vinner først!');
                }
              }}
              disabled={!selectedWinner}
              style={[styles.nextButton, !selectedWinner ? styles.disabledButton : {}]}
              textStyle={styles.nextButtonText}
            />
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Venter på at host velger vinner...</Text>
          </View>
        )}
      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
    color: '#FAF0DE',
  },
  challengeContainer: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  description: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FAF0DE',
    lineHeight: 24,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 30,
    flexWrap: 'wrap',
    gap: 15,
  },
  button: {
    minWidth: 120,
    paddingVertical: 15,
    paddingHorizontal: 20,
    backgroundColor: '#2f7a4c',
    borderRadius: 8,
  },
  selectedButton: {
    backgroundColor: '#FF4500',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  selectedButtonText: {
    color: '#FFFFFF',
  },
  nextButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  nextButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#FAF0DE',
  },
});
