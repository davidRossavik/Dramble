import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

import AppText from '@/components/AppText';
import BackgroundWrapper from '@/components/BackgroundWrapper';
import Button from '@/components/Button';

import { addTeamToGame, getGameByCode } from '@/utils/games';
import { getRandomTeamName } from '@/utils/nameGenerator';

export default function JoinGame() {
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const generateId = () => Math.random().toString(36).substring(2, 8).toUpperCase();

//   const handleJoin = async () => {
//     if (!code.trim()) {
//       setError('Skriv inn en spillkode');
//       return;
//     }

//     const cleanName = name.trim();

//     const { data, error: fetchError } = await getGameByCode(code.trim().toUpperCase());
//     if (fetchError || !data) {
//       setError('Fant ikke spill med denne koden');
//       return;
//     }

//     const gameId = data.id;
//     const existingTeams = data.teams ?? [];
//     const balances = data.balances ?? {};
//     // Finn startverdi fra balances (bruk første lag sin verdi, eller 100 som fallback)
//     const balanceValues = Object.values(balances);
//     const startBalance = balanceValues.length > 0 ? Number(balanceValues[0]) : 100;

//     // Random Lagnavn-generator //
//     const existingNames = existingTeams.map((team: { teamName: any; }) => team.teamName);
//     const randomTeamName = getRandomTeamName(existingNames);
//     // Random Lagnavn-generator //

//     const newTeam = {
//         teamName: randomTeamName,
//         players: [{
//             id: generateId(), // Eller crypto.randomUUID
//             name: cleanName,
//         }],
//     };

//     await addTeamToGame(gameId, newTeam, startBalance);

//     await AsyncStorage.setItem('gameCode', code);
//     await AsyncStorage.setItem('teamName', randomTeamName); 
//     await AsyncStorage.setItem('playerName', cleanName); 
//     await AsyncStorage.setItem('isHost', 'false');


//     const upperCode = code.trim().toUpperCase();

//     console.log("kjørt");
//     setError('');
//     router.push({
//       pathname: '/startGame',
//       params: {code: upperCode},
//     });
//   };

const handleJoin = async () => {
  console.log("🔵 Start handleJoin");

  if (!code.trim()) {
    console.log("❌ Mangler spillkode");
    setError('Skriv inn en spillkode');
    return;
  }

  const cleanName = name.trim();
  console.log("🟢 Henter spill:", code.trim().toUpperCase());

  const { data, error: fetchError } = await getGameByCode(code.trim().toUpperCase());
  if (fetchError || !data) {
    console.log("❌ Fant ikke spill");
    console.log("fetchError:", fetchError);
    console.log("data:", data);
    setError('Fant ikke spill med denne koden');
    return;
}


  console.log("✅ Fant spill:", data);

  const gameId = data.id;
  const existingTeams = data.teams ?? [];
  const balances = data.balances ?? {};
  const balanceValues = Object.values(balances);
  const startBalance = balanceValues.length > 0 ? Number(balanceValues[0]) : 100;

  const existingNames = existingTeams.map((team: { teamName: any; }) => team.teamName);
  const randomTeamName = getRandomTeamName(existingNames);

  const newTeam = {
    teamName: randomTeamName,
    players: [{
      id: generateId(),
      name: cleanName,
    }],
  };

  console.log("🟢 Legger til lag:", newTeam);

  const addResult = await addTeamToGame(gameId, newTeam, startBalance);
  if (addResult?.error) {
    console.log("❌ Feil ved addTeamToGame:", addResult.error);
    setError('Klarte ikke legge til laget');
    return;
  }

  console.log("✅ Lag lagt til. Lagrer info i AsyncStorage");

  await AsyncStorage.setItem('gameCode', code);
  await AsyncStorage.setItem('teamName', randomTeamName);
  await AsyncStorage.setItem('playerName', cleanName);
  await AsyncStorage.setItem('isHost', 'false');

  const upperCode = code.trim().toUpperCase();
  console.log("🚀 Navigerer til /startGame med kode:", upperCode);

  setError('');
  router.push({
    pathname: '/startGame',
    params: { code: upperCode },
  });
};



   return (
    <BackgroundWrapper>
      <View style={styles.container}>
        <AppText style={styles.title}>Bli med i spill</AppText>

        <TextInput
          style={[styles.input, {color: '#F0E3C0'}]}
          placeholder="Spillkode"
          placeholderTextColor={"rgba(240, 227, 192, 0.6)"}
          value={code}
          onChangeText={setCode}
          autoCapitalize="characters"
        />

        <TextInput
          style={[styles.input, {color: '#F0E3C0'}]}
          placeholder="Ditt navn"
          placeholderTextColor={"rgba(240, 227, 192, 0.6)"}
          value={name}
          onChangeText={setName}
        />

        {error ? <AppText style={styles.errorText}>{error}</AppText> : null}

        <Button style={styles.button} onPress={handleJoin} 
            textStyle={styles.buttonText} label={'Bli med'}/>

      </View>
    </BackgroundWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 30,
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    color: '#F0E3C0',
  },
  input: {
    width: '80%',
    padding: 12,
    borderWidth: 2,
    borderColor: '#D49712',
    borderRadius: 15,
    fontSize: 25,
    backgroundColor: '#073510',
    fontFamily: 'CherryBombOne-Regular'
  },
  button: {
    backgroundColor: '#D49712',
    paddingVertical: 14,
    paddingHorizontal: 30,
    borderRadius: 100,
  },
  buttonText: {
    color: '#F0E3C0',
    fontWeight: 'bold',
    fontSize: 25,
  },
  errorText: {
    color: 'red',
    fontSize: 14,
  },
});