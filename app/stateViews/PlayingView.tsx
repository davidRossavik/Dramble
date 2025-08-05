import AppText from '@/components/AppText';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { setWinnerForChallenge } from '@/utils/games';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { SafeAreaView, StyleSheet, View } from 'react-native';

type Props = {
  runde: Runde;
  gameId: string;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean;
};

export default function PlayingView({ runde, gameId, onNextPhaseRequested, isTransitioning }: Props) {
  const [localSelectedWinner, setLocalSelectedWinner] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  console.log('PlayingView mount/render', runde.challengeIndex);

  // Sjekk om bruker er host
  useEffect(() => {
    AsyncStorage.getItem('isHost').then((hostValue) => {
      setIsHost(hostValue === 'true');
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
        // For Team-vs-itself skal laget utføre utfordringen internt
        const teamName = runde.selectedTeams[0]?.teamName || 'Laget';
        return `${teamName} skal: ${runde.challenge.description}`;
      
      default:
        return runde.challenge.description;
    }
  };

  const handleWinnerSelection = (winner: string) => {
    // Sett lokal valg umiddelbart for visuell feedback
    setLocalSelectedWinner(winner);
    // Ikke lagre til Supabase her!
  };

  const winnerOptions = getWinnerOptions();

  return (
    <BackgroundWrapper>
      <SafeAreaView style={styles.container}>
        <AppText style={styles.title}>Utfordring pågår!</AppText>
        
        <View style={styles.challengeContainer}>
          <AppText style={styles.description}>{getChallengeDescription()}</AppText>
        </View>

        {isHost ? (
          <>
            <AppText style={styles.instruction}>Velg vinner</AppText>
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

            <Button
              label="Se resultat"
              onPress={async () => {
                if (selectedWinner) {
                  // Lagre vinner i Supabase først, hvis ikke allerede lagret
                  if (isHost && !runde.winner) {
                    const { error } = await setWinnerForChallenge(gameId, runde.challengeIndex, selectedWinner);
                    if (error) {
                      console.error('Feil ved lagring av vinner:', error);
                      alert('Feil ved lagring av vinner. Prøv igjen.');
                      return;
                    }
                  }
                  onNextPhaseRequested();
                } else {
                  alert('Du må velge en vinner først!');
                }
              }}
              disabled={!selectedWinner}
              style={[styles.nextButton, !selectedWinner ? styles.disabledButton : {}]}
              textStyle={styles.nextButtonText}
            />
            </View>
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <AppText style={styles.waitingText}>Venter på at host velger vinner...</AppText>
          </View>
        )}
      </SafeAreaView>
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
    fontSize: 40,
    fontWeight: 'bold',
    marginBottom: 50,
    textAlign: 'center',
    color: '#D49712',
  },
  challengeContainer: {
    marginBottom: 50,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    // @ts-ignore
    backdropFilter: 'blur(6px)', // web only
  },
  description: {
    fontSize: 25,
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
    marginBottom: 50
  },
  selectedButton: {
    backgroundColor: '#FF4500',
  },
  buttonText: {
    fontSize: 22,
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
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0F2D17',
    textAlign: 'center',
  },
  waitingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waitingText: {
    fontSize: 25,
    textAlign: 'center',
    color: '#FAF0DE',
  },
  instruction: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#D49712',
    textAlign: 'center',
    marginBottom: 50,
    marginTop: 8,
    letterSpacing: 1,
  },
});
