import AppText from '@/components/AppText';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Slider from '@react-native-community/slider';
import { useEffect, useRef, useState } from 'react';
import { Image, SafeAreaView, ScrollView, StyleSheet, View } from 'react-native';

const drinkCountImg = require('@/assets/images/drinkCount.png');
const versusImg = require('@/assets/images/VS_Image.png');

type Props = {
  runde: Runde;
  balances: Record<string, number>;
  onPlaceBet: (bet: { teamName: string; betOn: string; amount: number }) => void;
};

export default function OneVsOne({ runde, balances, onPlaceBet }: Props) {
  const [playerName, setPlayerName] = useState<string>('');
  const [teamName, setTeamName] = useState<string>('');
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [betAmount, setBetAmount] = useState<number>(0);
  const [teamBalance, setTeamBalance] = useState<number | null>(null);
  const [betError, setBetError] = useState<string | null>(null);
  const [isPlacingBet, setIsPlacingBet] = useState(false);
  const isPlacingBetRef = useRef(false);

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

  const handlePlaceBet = async () => {
    if (!selectedPlayer || !playerName || !teamName) {
      alert('Vennligst velg spiller og skriv inn betting-beløp');
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
      await onPlaceBet({ teamName, betOn: selectedPlayer, amount });
      setBetAmount(0);
      setSelectedPlayer('');
    } finally {
      setIsPlacingBet(false);
      isPlacingBetRef.current = false;
    }
  };

  const getPlayerOptions = () => {
    return runde.challenge.participants || ['Spiller 1', 'Spiller 2'];
  };

  const playerOptions = getPlayerOptions();

  const allBets = [...(runde.betResults || [])];

  return (
    <BackgroundWrapper>
      <SafeAreaView style={{ flex: 1 }}>
        {teamBalance !== null && (
          <View style={styles.drinkCountCorner}>
            <AppText style={styles.drinkCountText}>{teamBalance}</AppText>
            <Image source={drinkCountImg} style={styles.drinkCountImg} />
          </View>
        )}
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.contentContainer}>
            <View style={styles.titleRow}>
              <AppText style={styles.teamTitle}>{playerOptions[0]}</AppText>
              <Image source={versusImg} style={styles.versusIcon} />
              <AppText style={styles.teamTitle}>{playerOptions[1]}</AppText>
            </View>

            <View style={styles.descriptionBox}>
              <AppText style={styles.description}>{runde.challenge.description}</AppText>
            </View>

            <View style={styles.playerSelection}>
              <AppText style={styles.label}>Velg spiller:</AppText>
              <View style={styles.buttons}>
                {playerOptions.map((player, idx) => (
                  <Button
                    key={idx}
                    label={player}
                    onPress={() => setSelectedPlayer(player)}
                    style={[
                      styles.playerButton,
                      selectedPlayer === player ? styles.selectedPlayerButton : {},
                    ]}
                    textStyle={[
                      styles.playerButtonText,
                      selectedPlayer === player ? styles.selectedPlayerButtonText : {},
                    ]}
                  />
                ))}
              </View>
            </View>

            <AppText style={styles.sliderValue}>{betAmount}</AppText>
            <Slider
              style={styles.slider}
              minimumValue={0}
              maximumValue={10}
              step={1}
              value={betAmount}
              onValueChange={(val) => {
                setBetAmount(val);
                setBetError(null);
              }}
              minimumTrackTintColor="#81AF24"
              maximumTrackTintColor="#00471E"
              thumbTintColor="#FF4500"
            />
            {betError && <AppText style={styles.errorText}>{betError}</AppText>}

            <Button
              label={isPlacingBet ? 'Sender inn...' : 'Plasser veddemål'}
              onPress={handlePlaceBet}
              disabled={isPlacingBet || !selectedPlayer || betAmount <= 0 || !!betError}
              style={[
                styles.betButton,
                (isPlacingBet || !selectedPlayer || betAmount <= 0 || !!betError)
                  ? styles.disabledButton
                  : {},
              ]}
              textStyle={styles.betButtonText}
            />

            <View style={styles.currentBetsContainer}>
              <AppText style={styles.currentBetsTitle}>Nåværende veddemål:</AppText>
              {allBets.length > 0 ? (
                allBets.map((bet, idx) => (
                  <View key={idx} style={styles.betItem}>
                    <AppText style={styles.betTeam}>{bet.teamName}</AppText>
                    <AppText style={styles.betInfo}>
                      Vedder {bet.amount} slurker på "{bet.betOn}"
                    </AppText>
                  </View>
                ))
              ) : (
                <AppText style={styles.noBets}>Ingen veddemål ennå</AppText>
              )}
            </View>
          </ScrollView>
        </View>
      </SafeAreaView>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  contentContainer: {
    padding: 24,
    flexGrow: 1,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  teamTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  versusIcon: {
    width: 45,
    height: 45,
    resizeMode: 'contain',
    marginHorizontal: 10,
  },
  descriptionBox: {
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    borderColor: '#D49712',
    borderWidth: 2,
    // @ts-ignore
    backdropFilter: 'blur(6px)',
  },
  description: {
    color: '#FAF0DE',
    fontSize: 18,
    textAlign: 'center',
  },
  playerSelection: {
    marginBottom: 16,
  },
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FAF0DE',
    marginBottom: 20,
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
    marginTop: 5,
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
    fontSize: 16,
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
    color: 'rgba(0,0,0,0.9)',
    textAlign: 'center',
  },
  currentBetsContainer: {
    marginTop: 32,
  },
  currentBetsTitle: {
    fontSize: 22,
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
  playerButton: {
    minWidth: 100,
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#2f7a4c',
    borderRadius: 8,
    marginHorizontal: 4,
  },
  selectedPlayerButton: {
    backgroundColor: '#FF4500',
  },
  playerButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FAF0DE',
    textAlign: 'center',
  },
  selectedPlayerButtonText: {
    color: '#FFFFFF',
  },
  drinkCountCorner: {
    position: 'absolute',
    top: 60,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(34,34,34,0.7)',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 4,
    zIndex: 10,
  },
  drinkCountImg: {
    width: 35,
    height: 35,
    marginLeft: 6,
  },
  drinkCountText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 20,
  },
});
