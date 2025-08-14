import React from 'react';
import { StyleProp, Text, TextProps, TextStyle } from 'react-native';

type AppTextProps = TextProps & {
  style?: StyleProp<TextStyle>;
  children: React.ReactNode;
};

export default function AppText({ style, children, ...rest }: AppTextProps) {
  return (
    <Text
      {...rest}
      style={[{ fontFamily: 'Poppins-Bold' , color: '#FAF0DE'}, style]}
    >
      {children}
    </Text>
  );
}
