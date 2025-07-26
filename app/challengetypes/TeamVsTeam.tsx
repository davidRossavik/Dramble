import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useEffect, useRef, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';

const drinkCountImg = require('@/assets/images/drinkCount.png');

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    flexGrow: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  descriptionBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    marginTop: 56, // Økt for å unngå overlap
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    // @ts-ignore
    backdropFilter: 'blur(6px)', // web only
  },
  description: {
    color: '#FAF0DE',
    fontSize: 18,
    textAlign: 'center',
  },
  bettingContainer: {
    marginTop: 12,
    marginBottom: 24,
  },
  bettingTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
    marginBottom: 16,
  },
  teamSelection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 10,
    textAlign: 'center',
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
  },
  sliderValue: {
    fontSize: 28,
    color: '#FAF0DE',
    textAlign: 'center',
    marginTop: 24,
    marginBottom: 0,
    fontWeight: 'bold',
  },
  slider: {
    width: '100%',
    height: 40,
    alignSelf: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 8,
  },
  betButton: {
    backgroundColor: '#EEB90E',
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginTop: 16,
  },
  disabledButton: {
    backgroundColor: '#666',
  },
  betButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  currentBetsContainer: {
    marginTop: 32,
  },
  currentBetsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
    marginBottom: 12,
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
  teamButton: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2f7a4c',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedTeamButton: {
    backgroundColor: '#FF4500',
  },
  teamButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  selectedTeamButtonText: {
    color: '#FFFFFF',
  },
  drinkCountCorner: {
    position: 'absolute',
    top: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,34,34,0.7)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    zIndex: 10,
  },
  drinkCountImg: {
    width: 32,
    height: 32,
    marginRight: 6,
  },
  drinkCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
});

type Props = {
  runde: Runde;
  balances: Record<string, number>;
  onPlaceBet: (bet: { teamName: string; betOn: string; amount: number }) => void;
  // localBets?: { teamName: string; betOn: string; amount: number }[]; // Fjernet
};

export default function TeamVsTeam({ runde, balances, onPlaceBet }: Props) {
  const [teamName, setTeamName] = useState<string>('');
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0); // Endret til number for slider
  const [teamBalance, setTeamBalance] = useState<number | null>(null);
  const [betError, setBetError] = useState<string | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const isPlacingBetRef = useRef(false);

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
    if (!selectedTeam || !teamName) {
      alert('Vennligst velg lag og skriv inn betting-beløp');
      return;
    }

    const amount = betAmount;
    if (isNaN(amount) || amount <= 0) {
      setBetError('Vennligst velg et gyldig beløp');
      return;
    }

    if (teamBalance !== null && amount > teamBalance) {
      setBetError('Du kan ikke vedde mer enn du har igjen!');
      return;
    }
    setBetError(null);

    setIsPlacingBet(true);
    try {
      await onPlaceBet({ teamName, betOn: selectedTeam, amount });
      setBetAmount(0);
    setSelectedTeam('');
    } finally {
      setIsPlacingBet(false);
      isPlacingBetRef.current = false;
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

  // Kombiner betResults og localBets
  const allBets = [
    ...(runde.betResults || [])
    // ...(localBets || []) // Fjernet
  ];

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          {teamBalance !== null && (
            <View style={styles.drinkCountCorner}>
              <Image source={drinkCountImg} style={styles.drinkCountImg} />
              <Text style={styles.drinkCountText}>{teamBalance}</Text>
            </View>
          )}
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.descriptionBox}>
          <Text style={styles.description}>{getChallengeDescription()}</Text>
        </View>
          <Text style={styles.bettingTitle}>Plasser ditt veddemål</Text>
          <View style={styles.teamSelection}>
            <Text style={styles.label}>Velg lag:</Text>
            <View style={styles.buttons}>
                {teamOptions.map((team, idx) => (
                <Button
                    key={idx}
                  label={team}
                  onPress={() => setSelectedTeam(team)}
                  style={[
                    styles.teamButton,
                      selectedTeam === team ? styles.selectedTeamButton : {},
                  ]}
                  textStyle={[
                    styles.teamButtonText,
                      selectedTeam === team ? styles.selectedTeamButtonText : {},
                  ]}
                />
              ))}
            </View>
          </View>
            <Text style={styles.sliderValue}>{betAmount}</Text>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={betAmount}
              onValueChange={val => {
                setBetAmount(val);
                setBetError(null);
              }}
              minimumTrackTintColor="#81AF24"
              maximumTrackTintColor="#00471E"
              thumbTintColor="#FF4500"
            />
            {betError && <Text style={styles.errorText}>{betError}</Text>}
          <Button
              label={isPlacingBet ? "Sender inn..." : "Plasser veddemål"}
            onPress={handlePlaceBet}
              disabled={isPlacingBet || !selectedTeam || betAmount <= 0 || !!betError}
            style={[
              styles.betButton,
                (isPlacingBet || !selectedTeam || betAmount <= 0 || !!betError) ? styles.disabledButton : {},
            ]}
            textStyle={styles.betButtonText}
          />
        <View style={styles.currentBetsContainer}>
          <Text style={styles.currentBetsTitle}>Nåværende veddemål:</Text>
          {allBets.length > 0 ? (
                allBets.map((bet, idx) => (
                  <View key={idx} style={styles.betItem}>
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
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}
