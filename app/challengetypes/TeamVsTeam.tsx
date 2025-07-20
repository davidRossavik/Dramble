import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { submitBet } from '@/utils/bets';
import { Runde, Team } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  runde: Runde;
  gameId: string;
  challengeIndex: number;
  teams: Team[];
  allTeams: Team[];
  balances?: Record<string, number>;
};

export default function TeamVsTeam({ runde, gameId, challengeIndex, teams, allTeams, balances }: Props) {
  const [teamName, setTeamName] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const [teamBalance, setTeamBalance] = useState<number | null>(null);

  // Hent team-navn
  useEffect(() => {
    AsyncStorage.getItem('teamName').then((name) => {
      if (name) setTeamName(name);
    });
  }, []);

  useEffect(() => {
    AsyncStorage.getItem('teamName').then((team) => {
      if (team && balances && balances[team]) setTeamBalance(balances[team]);
    });
  }, [balances]);

  const handlePlaceBet = async () => {
    if (!selectedTeam || !betAmount || !teamName) {
      alert('Vennligst velg lag og skriv inn betting-beløp');
      return;
    }

    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Vennligst skriv inn et gyldig beløp');
      return;
    }

    setIsPlacingBet(true);
    try {
      const { error } = await submitBet(gameId, teamName, challengeIndex, amount, selectedTeam);
      if (error) {
        console.error('Feil ved betting:', error);
        alert('Feil ved betting. Prøv igjen.');
      } else {
        // Reset form
        setSelectedTeam('');
        setBetAmount('');
        alert('Betting registrert!');
      }
    } catch (error) {
      console.error('Uventet feil ved betting:', error);
      alert('Uventet feil ved betting. Prøv igjen.');
    } finally {
      setIsPlacingBet(false);
    }
  };

  const getTeamOptions = () => {
    return runde.selectedTeams.map(team => team.teamName);
  };

  const getChallengeDescription = () => {
    const team1 = runde.selectedTeams[0]?.teamName || 'Lag 1';
    const team2 = runde.selectedTeams[1]?.teamName || 'Lag 2';
    return `${team1} vs ${team2}: ${runde.challenge.description}`;
  };

  const teamOptions = getTeamOptions();

  return (
    <BackgroundWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>Lag vs Lag Challenge</Text>
        
        <View style={styles.challengeContainer}>
          <Text style={styles.description}>{getChallengeDescription()}</Text>
        </View>

        <View style={styles.bettingContainer}>
          <Text style={styles.bettingTitle}>Plasser ditt veddemål</Text>
          
          <View style={styles.teamSelection}>
            <Text style={styles.label}>Velg lag:</Text>
            <View style={styles.buttons}>
              {teamOptions.map((team, index) => (
                <Button
                  key={index}
                  label={team}
                  onPress={() => setSelectedTeam(team)}
                  style={[
                    styles.teamButton,
                    selectedTeam === team ? styles.selectedTeamButton : {}
                  ]}
                  textStyle={[
                    styles.teamButtonText,
                    selectedTeam === team ? styles.selectedTeamButtonText : {}
                  ]}
                />
              ))}
            </View>
          </View>

          <View style={styles.betAmountContainer}>
            <Text style={styles.label}>Antall slurker:</Text>
            <TextInput
              style={styles.input}
              value={betAmount}
              onChangeText={setBetAmount}
              placeholder="Skriv inn antall slurker"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />
          </View>

          {/* Vis lagets balance */}
          {teamBalance !== null && (
            <Text style={{color: '#F0E3C0', fontWeight: 'bold', marginBottom: 8}}>
              Slurker igjen: {teamBalance}
            </Text>
          )}

          <Button
            label={isPlacingBet ? "Plasserer veddemål..." : "Plasser veddemål"}
            onPress={handlePlaceBet}
            disabled={!selectedTeam || !betAmount || isPlacingBet}
            style={[
              styles.betButton,
              (!selectedTeam || !betAmount || isPlacingBet) ? styles.disabledButton : {}
            ]}
            textStyle={styles.betButtonText}
          />
        </View>

        <View style={styles.currentBetsContainer}>
          <Text style={styles.currentBetsTitle}>Nåværende veddemål:</Text>
          
          {runde.betResults.length > 0 ? (
            runde.betResults.map((bet, index) => (
              <View key={index} style={styles.betItem}>
                <Text style={styles.betTeam}>{bet.teamName}</Text>
                <Text style={styles.betInfo}>
                  Vedder {bet.amount} slurker på "{bet.betOn}"
                </Text>
              </View>
            ))
          ) : (
            <Text style={styles.noBets}>Ingen veddemål ennå</Text>
          )}
        </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
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
  bettingContainer: {
    marginBottom: 30,
  },
  bettingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 20,
  },
  teamSelection: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 10,
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 10,
  },
  teamButton: {
    minWidth: 120,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2f7a4c',
    borderRadius: 8,
  },
  selectedTeamButton: {
    backgroundColor: '#FF4500',
  },
  teamButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  selectedTeamButtonText: {
    color: '#FFFFFF',
  },
  betAmountContainer: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 12,
    borderRadius: 8,
    fontSize: 16,
    color: '#000',
  },
  betButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  betButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  currentBetsContainer: {
    marginTop: 20,
  },
  currentBetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#FAF0DE',
    marginBottom: 15,
  },
  betItem: {
    marginBottom: 10,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
  },
  betTeam: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 5,
  },
  betInfo: {
    fontSize: 12,
    color: '#FAF0DE',
  },
  noBets: {
    fontSize: 14,
    textAlign: 'center',
    color: '#FAF0DE',
    fontStyle: 'italic',
  },
});
