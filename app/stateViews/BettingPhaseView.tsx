import OneVsOne from '@/app/challengetypes/OneVsOne';
import TeamVsItself from '@/app/challengetypes/TeamVsItself';
import TeamVsTeam from '@/app/challengetypes/TeamVsTeam';
import { submitBet } from '@/utils/bets';
import { getGameById } from '@/utils/games';
import { Runde } from '@/utils/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { supabase } from '../../supabase-functions/supabase.js';

import Button from '@/components/Button';

type Props = {
  runde: Runde;
  gameId: string;
  isHost: boolean;
  onNextPhaseRequested: () => void;
  isTransitioning?: boolean;
};

export default function BettingPhaseView({ runde, gameId, isHost, onNextPhaseRequested, isTransitioning }: Props) {
  const [balances, setBalances] = useState<Record<string, number>>({});
  const [myTeamName, setMyTeamName] = useState<string | null>(null);
  const [localBets, setLocalBets] = useState<any[]>([]); // Lokale bets

  useEffect(() => {
    async function fetchBalances() {
      const { data } = await getGameById(gameId); // runde.code hvis tilgjengelig, ellers gameId
      if (data && data.balances) setBalances(data.balances);
    }
    fetchBalances();
    AsyncStorage.getItem('teamName').then(setMyTeamName);

    // Sett opp real-time listener for balance oppdateringer
    const channel = supabase
      .channel(`balances-${gameId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'games',
          filter: `id=eq.${gameId}`,
        },
        (payload) => {
          if (payload.new.balances) {
            setBalances(payload.new.balances);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [gameId, runde]);

  // Ikke vis noen loading states hvis parent er i transition
  if (isTransitioning) {
    return null; // Returner ingenting, la parent håndtere loading
  }

  // Hvis ingen lag er valgt, vent på at de velges automatisk
  if (runde.selectedTeams.length === 0) {
    return (
      <View style={styles.container}>
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={styles.errorText}>Venter på at lag velges...</Text>
        </View>
      </View>
    );
  }

  // Vis balances for alle lag
  const renderBalances = () => {
    if (!myTeamName || !balances[myTeamName]) return null;
    return (
      <View style={{marginBottom: 16}}>
        <Text style={{fontWeight: 'bold', color: '#F0E3C0', marginBottom: 4}}>Slurker igjen:</Text>
        <Text style={{color: '#F0E3C0'}}>{balances[myTeamName]}</Text>
      </View>
    );
  };

  // Legg til en hjelpefunksjon for å oppdatere balances lokalt
  // function optimisticUpdateBalance(teamName: string, amount: number) {
  //   setBalances(prev => ({
  //     ...prev,
  //     [teamName]: (prev[teamName] || 0) - amount
  //   }));
  // }

  // Når et lag legger inn et bet (bruk denne i stedet for submitBet):
  const handlePlaceBet = async (bet: { teamName: string; betOn: string; amount: number }) => {
    try {
      const result = await submitBet(gameId, bet.teamName, runde.challengeIndex, bet.amount, bet.betOn);
      if (result && result.error) {
        alert(result.error);
      } else {
        // Optimistisk oppdatering av balance lokalt
        // optimisticUpdateBalance(bet.teamName, bet.amount);
      }
    } catch (err) {
      console.error('Uventet feil i handlePlaceBet:', err);
    }
    // ...reset form, vis feedback...
  };

  // Vis kun lokale bets (evt. + runde.betResults hvis ønskelig)
  // const allBets = [...localBets]; // Fjernet localBets

  // Render betting komponent basert på challenge type
  const renderBettingComponent = () => {
    switch (runde.challenge.type) {
      case '1v1':
        return <OneVsOne runde={runde} balances={balances} onPlaceBet={handlePlaceBet} />;
      case 'Team-vs-Team':
        return <TeamVsTeam runde={runde} balances={balances} onPlaceBet={handlePlaceBet} />;
      case 'Team-vs-itself':
        return <TeamVsItself runde={runde} balances={balances} onPlaceBet={handlePlaceBet} />;
      default:
        return <Text style={styles.errorText}>Ukjent challenge-type</Text>;
    }
  };

  return (
    <View style={styles.container}>
      {/* {renderBalances()} Fjernet, vises kun i betting-komponentene */}
      {renderBettingComponent()}
      {isHost && runde.selectedTeams.length > 0 && (
        <Button onPress={onNextPhaseRequested} style={styles.startButton} label={"Start Challenge"} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
  },
  startButton: {
    marginTop: 20,
    fontSize: 18,
    textAlign: 'center',
    color: '#fff',
    backgroundColor: '#2f7a4c',
    padding: 12,
    borderRadius: 10,
    marginHorizontal: 20,
  },
  errorText: {
    textAlign: 'center',
    color: 'red',
    marginTop: 20,
  },
});
