import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Header from './Header';
import { SafeAreaView } from 'react-native-safe-area-context';

interface ContainerProps {
  children: React.ReactNode;
}

export default function Container({ children }: ContainerProps) {
  return (
    <SafeAreaView style={styles.container}>
      <Header />
      <View style={styles.wrapper}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: 'white',
  },
  wrapper: {
    width: '100%',
    flex: 1,
    backgroundColor: '#f1f6fe',
  },
  logo: {
    height: 300,
    borderColor: 'red',
    borderWidth: 1,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heading: {
    fontSize: 32,
    fontWeight: '600',
  },
  subheading: {
    fontSize: 18,
    opacity: 0.75,
  },
});
