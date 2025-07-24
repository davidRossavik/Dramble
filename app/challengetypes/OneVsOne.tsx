import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

type Props = {
  runde: Runde;
  balances: Record<string, number>;
  onPlaceBet: (bet: { teamName: string; betOn: string; amount: number }) => void;
  
};

export default function OneVsOne({ runde, balances, onPlaceBet }: Props) {
  const [playerName, setPlayerName] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [betAmount, setBetAmount] = useState<string>('');
  const [teamBalance, setTeamBalance] = useState<number | null>(null);
  const [betError, setBetError] = useState<string | null>(null);

  // Hent spiller-navn og lag-navn
  useEffect(() => {
    AsyncStorage.getItem('playerName').then((name) => {
      if (name) setPlayerName(name);
    });
    AsyncStorage.getItem('teamName').then((team) => {
      if (team) {
        setTeamName(team);
        if (balances && balances[team]) setTeamBalance(balances[team]);
      }
    });
  }, [balances]);

  const handlePlaceBet = () => {
    if (!selectedPlayer || !betAmount || !playerName || !teamName) {
      alert('Vennligst velg spiller og skriv inn betting-beløp');
      return;
    }

    const amount = parseInt(betAmount);
    if (isNaN(amount) || amount <= 0) {
      setBetError('Vennligst skriv inn et gyldig beløp');
      return;
    }

    if (teamBalance !== null && amount > teamBalance) {
      setBetError('Du kan ikke vedde mer enn du har igjen!');
      return;
    }
    setBetError(null);

    onPlaceBet({ teamName, betOn: selectedPlayer, amount });
    setBetAmount('');
    setSelectedPlayer('');
  };

  const getPlayerOptions = () => {
    return runde.challenge.participants || ['Spiller 1', 'Spiller 2'];
  };

  const getChallengeDescription = () => {
    const [player1, player2] = getPlayerOptions();
    return `${player1} vs ${player2}: ${runde.challenge.description}`;
  };

  const playerOptions = getPlayerOptions();

  // Kombiner betResults og localBets
  const allBets = [
    ...(runde.betResults || [])
    // ...(localBets || []) // Fjernet
  ];

  return (
    <BackgroundWrapper>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        <Text style={styles.title}>1v1 Challenge</Text>
        
        <View style={styles.challengeContainer}>
          <Text style={styles.description}>{getChallengeDescription()}</Text>
        </View>

        <View style={styles.bettingContainer}>
          <Text style={styles.bettingTitle}>Plasser ditt veddemål</Text>
          
          <View style={styles.playerSelection}>
            <Text style={styles.label}>Velg spiller:</Text>
            <View style={styles.buttons}>
              {playerOptions.map((player: string, index: number) => (
                <Button
                  key={index}
                  label={player}
                  onPress={() => setSelectedPlayer(player)}
                  style={[
                    styles.playerButton,
                    selectedPlayer === player ? styles.selectedPlayerButton : {}
                  ]}
                  textStyle={[
                    styles.playerButtonText,
                    selectedPlayer === player ? styles.selectedPlayerButtonText : {}
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
              onChangeText={text => {
                setBetAmount(text);
                setBetError(null);
              }}
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

          {/* Vis feilmelding hvis innsats er ugyldig */}
          {betError && (
            <Text style={{color: 'red', marginBottom: 8}}>{betError}</Text>
          )}

          <Button
            label="Plasser veddemål"
            onPress={handlePlaceBet}
            disabled={!selectedPlayer || !betAmount || !!betError}
            style={[
              styles.betButton,
              (!selectedPlayer || !betAmount || !!betError) ? styles.disabledButton : {}
            ]}
            textStyle={styles.betButtonText}
          />
        </View>

                 <View style={styles.currentBetsContainer}>
           <Text style={styles.currentBetsTitle}>Nåværende veddemål:</Text>
           
           {allBets.length > 0 ? (
             allBets.map((bet, index) => (
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
    flex: 2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 80,
    gap: 40,
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'center',
    color: '#FAF0DE',
    lineHeight: 22,
    fontWeight: 'bold',
    marginBottom: 10,
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
  playerSelection: {
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
  playerButton: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2f7a4c',
    borderRadius: 8,
  },
  selectedPlayerButton: {
    backgroundColor: '#FF4500',
  },
  playerButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  selectedPlayerButtonText: {
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

  // TEXT //
  baseText: {
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  drinkCountText: {
    fontSize: 25,
  },
  challengeText: {
    fontSize: 30,
  },
  buttonText: {
    fontSize: 20,
  },
  sliderText: {
    fontSize: 25,
    marginBottom: 20,
  },

  // BUTTONS //
  buttonBase: {
    width: 170,
    height: 100,
    borderRadius: 5,
  },
  button1: {
    backgroundColor: '#EEB90E',
  },
  button2: {
    backgroundColor: '#D41E1D',
  },
  exitButton: {
    width: 280,
    height: 80,
    backgroundColor: '#EEB90E',
  },

  // VIEWSTYLES //
  drinkCountContainer: {
    position: 'absolute',
    top: 60,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
  },
  drinkCountPic: {
    width: 80,
    height: 80,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 20,
    marginBottom: 50,
  },
  slider: {
    width: '80%',
    height: 40,
    alignSelf: 'center',
  },
});

