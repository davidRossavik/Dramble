import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { supabase } from '@/supabase';
import { getSelectedTeamsForChallenge, getWinnerForChallenge, setWinnerForChallenge } from '@/utils/games';
import { Challenge, Team } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  challengeIndex: number;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean; // Ny prop for å vite om parent er i transition
};

export default function PlayingView({ challenge, gameId, challengeIndex, onNextPhaseRequested, isTransitioning }: Props) {
  const [selectedWinner, setSelectedWinner] = useState<string | null>(null);
  const [selectedTeams, setSelectedTeams] = useState<Team[]>([]);
  const [isHost, setIsHost] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Hent valgte teams og sjekk om bruker er host
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      
      // Hent valgte teams
      const teams = await getSelectedTeamsForChallenge(gameId, challengeIndex);
      setSelectedTeams(teams);

      // Sjekk om bruker er host
      const playerName = await AsyncStorage.getItem('playerName');
      setIsHost(playerName === 'Host');
      
      // Hent eksisterende vinner hvis den finnes
      const existingWinner = await getWinnerForChallenge(gameId, challengeIndex);
      if (existingWinner) {
        setSelectedWinner(existingWinner);
      }
      
      setIsLoading(false);
    };

    fetchData();
  }, [gameId, challengeIndex]);

  // Realtime subscription for å lytte på vinner-oppdateringer
  useEffect(() => {
    const channel = supabase
      .channel(`winner-${gameId}-${challengeIndex}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        async (payload) => {
          if (payload.new.challenge_winners) {
            try {
              // Parse JSON hvis det er en string, ellers bruk direkte
              const challengeWinners = typeof payload.new.challenge_winners === 'string'
                ? JSON.parse(payload.new.challenge_winners)
                : payload.new.challenge_winners;
              
              const newWinner = challengeWinners[challengeIndex];
              if (newWinner && newWinner !== selectedWinner) {
                setSelectedWinner(newWinner);
              }
            } catch (parseError) {
              console.error('Feil ved parsing av challenge_winners i realtime:', parseError);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, challengeIndex]); // Fjernet selectedWinner fra dependency array

  const getWinnerOptions = () => {
    switch (challenge.type) {
      case '1v1':
        // For 1v1 bruker vi spiller-navnene fra challenge
        return challenge.participants || ['Spiller 1', 'Spiller 2'];
      
      case 'Team-vs-Team':
        // For Team-vs-Team bruker vi lagnavnene
        return selectedTeams.map(team => team.teamName);
      
      case 'Team-vs-itself':
        // For Team-vs-itself er det "Klarer" eller "Klarer ikke"
        return ['Klarer', 'Klarer ikke'];
      
      default:
        return [];
    }
  };

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

  const handleWinnerSelection = async (winner: string) => {
    // Optimistisk oppdatering: sett vinneren med én gang for bedre UX
    setSelectedWinner(winner);
    
    // Lagre vinner i databasen for å synkronisere med andre brukere
    if (isHost) {
      try {
        const { error } = await setWinnerForChallenge(gameId, challengeIndex, winner);
        if (error) {
          console.error('Feil ved lagring av vinner:', error);
          alert('Feil ved lagring av vinner. Prøv igjen.');
        }
      } catch (error) {
        console.error('Uventet feil ved lagring av vinner:', error);
        alert('Uventet feil ved lagring av vinner. Prøv igjen.');
      }
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
          <Text style={styles.title}>Laster challenge...</Text>
        </View>
      </BackgroundWrapper>
    );
  }

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

            {selectedWinner && (
              <View style={styles.selectedContainer}>
                <Text style={styles.selectedText}>Vinner: {selectedWinner}</Text>
              </View>
            )}

            <Button
              label="Neste fase"
              onPress={onNextPhaseRequested}
              disabled={!selectedWinner}
              style={[styles.nextButton, !selectedWinner ? styles.disabledButton : {}]}
              textStyle={styles.nextButtonText}
            />
          </>
        ) : (
          <View style={styles.waitingContainer}>
            <Text style={styles.waitingText}>Venter på at host velger vinner...</Text>
            {selectedWinner && (
              <View style={styles.selectedContainer}>
                <Text style={styles.selectedText}>Vinner: {selectedWinner}</Text>
              </View>
            )}
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
  selectedContainer: {
    marginBottom: 30,
    padding: 15,
    backgroundColor: 'rgba(255, 69, 0, 0.2)',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FF4500',
  },
  selectedText: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FF4500',
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
