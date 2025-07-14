import OneVsOne from '@/app/challengetypes/OneVsOne';
import TeamVsItself from '@/app/challengetypes/TeamVsItself';
import TeamVsTeam from '@/app/challengetypes/TeamVsTeam';
import { supabase } from '@/supabase';
import { Challenge } from '@/utils/types';
import { Text } from 'react-native';

type Props = {
  challenge: Challenge;
  gameId: string;
  isHost: boolean;
};

export default function BettingPhaseView({ challenge, gameId, isHost }: Props) {
  let BettingComponent;
  switch (challenge.type) {
    case '1v1':
      BettingComponent = <OneVsOne challenge={challenge} gameId={gameId} />;
      break;
    case 'Team-vs-Team':
      BettingComponent = <TeamVsTeam challenge={challenge} gameId={gameId} />;
      break;
    case 'Team-vs-itself':
      BettingComponent = <TeamVsItself challenge={challenge} gameId={gameId} />;
      break;
    default:
      return <Text>Ukjent challenge-type</Text>;
  }

  return (
    <>
      {BettingComponent}
      {isHost === true && (
        <Text
          onPress={async () => {
            await supabase
              .from('games')
              .update({ challenge_state: 'playing' })
              .eq('id', gameId);
          }}
          style={{
            marginTop: 20,
            fontSize: 18,
            textAlign: 'center',
            color: '#fff',
            backgroundColor: '#2f7a4c',
            padding: 10,
            borderRadius: 10,
          }}
        >
          Start Challenge
        </Text>
      )}
    </>
  );
}
