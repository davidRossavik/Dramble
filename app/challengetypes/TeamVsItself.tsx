// app/challenges/OneVsOneChallenge.tsx
import { Challenge } from '@/utils/types';
import React from 'react';
import { Text, View } from 'react-native';

type Props = {
    challenge: Challenge
}

export default function TeamVsItself({ challenge }:Props) {
  const { title, description } = challenge;
  return (
    <View>
      <Text>{title}</Text>
      <Text>{description}</Text>
      <Text>{challenge.category}</Text>
        <Text>{challenge.type}</Text>
        <Text>{challenge.odds}</Text>
    </View>
  );
}
