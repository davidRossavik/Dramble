import { Challenge } from '@/utils/types'; // hvis du har laget typen Challenge
import { useLocalSearchParams } from 'expo-router';
import { Text } from 'react-native';
import OneVsOne from './challengetypes/OneVsOne';
import TeamVsItself from './challengetypes/TeamVsItself';
import TeamVsTeam from './challengetypes/TeamVsTeam';

export default function ChallengeScreen() {
  const { challenge: challengeParam } = useLocalSearchParams();

  if (typeof challengeParam !== 'string') {
    return <Text>Ugyldig challenge-data</Text>;
  }

  let parsedChallenge: Challenge;
  try {
    parsedChallenge = JSON.parse(challengeParam);
  } catch (err) {
    return <Text>Feil i challenge-formatet</Text>;
  }

  switch (parsedChallenge.type) {
    case '1v1':
      return <OneVsOne challenge={parsedChallenge} />;
    case 'Team-vs-Team':
      return <TeamVsTeam challenge={parsedChallenge} />;
    case 'Team-vs-itself':
      return <TeamVsItself challenge={parsedChallenge} />;
    default:
      return <Text>Ukjent challenge-type: {parsedChallenge.type}</Text>;
  }
}
