import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';

const RaceScreen = () => {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(3);
  const [roundCount, setRoundCount] = useState(3);
  const [laneCount, setLaneCount] = useState(3);
  const [playerNames, setPlayerNames] = useState(['', '', '']);
  const [racers, setRacers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  useEffect(() => {
    setPlayerNames(Array.from({ length: playerCount }, (_, i) => playerNames[i] || ''));
  }, [playerCount]);

  const startTournament = () => {
    const finalNames = playerNames.map((name, i) => name.trim() || `Player ${i + 1}`);
    const initialRacers = finalNames.map(name => ({ name, wins: 0, opponents: [] }));
    setRacers(initialRacers);
    const firstRound = generateSwissMatches(initialRacers, laneCount);
    setRounds([{ number: 1, matches: firstRound }]);
    setCurrentRoundIndex(0);
    setStep(2);
  };

  const generateSwissMatches = (racers, laneSize) => {
    const shuffled = [...racers].sort(() => 0.5 - Math.random());
    const matches = [];
    for (let i = 0; i < shuffled.length; i += laneSize) {
      const group = shuffled.slice(i, i + laneSize);
      matches.push({ racers: group.map(r => r.name), winner: null });
    }
    return matches;
  };

  const handleWinnerSelect = (matchIndex, winnerName) => {
    const updatedRounds = [...rounds];
    const round = updatedRounds[currentRoundIndex];
    round.matches[matchIndex].winner = winnerName;
    setRounds(updatedRounds);

    const allDoneNow = updatedRounds[currentRoundIndex].matches.every(m => m.winner !== null);
if (allDoneNow) {
      setTimeout(() => {
        const updatedRacers = racers.map(racer => {
          const winMatch = updatedRounds[currentRoundIndex].matches.find(m => m.winner === racer.name);
          const opponents = updatedRounds[currentRoundIndex].matches
            .filter(m => m.racers.includes(racer.name))
            .flatMap(m => m.racers.filter(r => r !== racer.name));
          return winMatch
            ? { ...racer, wins: racer.wins + 1, opponents: [...racer.opponents, ...opponents] }
            : { ...racer, opponents: [...racer.opponents, ...opponents] };
        });
        setRacers(updatedRacers);

        if (currentRoundIndex + 1 < roundCount) {
          const nextMatches = generateSwissMatches(updatedRacers, laneCount);
          setRounds(prev => [...prev, { number: currentRoundIndex + 2, matches: nextMatches }]);
          setCurrentRoundIndex(currentRoundIndex + 1);
        } else {
          setCurrentRoundIndex(currentRoundIndex + 1);
        }
      }, 300);
    }
  };

  const isDone = currentRoundIndex === roundCount - 1 && rounds[roundCount - 1]?.matches.every(m => m.winner);

  const finalStandings = [...racers].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;
    const aOMW = a.opponents.reduce((sum, o) => sum + (racers.find(r => r.name === o)?.wins || 0), 0);
    const bOMW = b.opponents.reduce((sum, o) => sum + (racers.find(r => r.name === o)?.wins || 0), 0);
    return bOMW - aOMW;
  });

  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Swiss Tournament Setup</Text>

        <Text style={styles.subtitle}>Number of players</Text>
        <Picker selectedValue={playerCount} onValueChange={setPlayerCount}>
          {[...Array(8)].map((_, i) => (
            <Picker.Item key={i + 3} label={`${i + 3}`} value={i + 3} />
          ))}
        </Picker>

        <Text style={styles.subtitle}>Number of rounds</Text>
        <Picker selectedValue={roundCount} onValueChange={setRoundCount}>
          {[...Array(8)].map((_, i) => (
            <Picker.Item key={i + 3} label={`${i + 3}`} value={i + 3} />
          ))}
        </Picker>

        <Text style={styles.subtitle}>Lane count</Text>
        <Picker selectedValue={laneCount} onValueChange={setLaneCount}>
          <Picker.Item label="3 Lanes" value={3} />
          <Picker.Item label="5 Lanes" value={5} />
        </Picker>

        <Text style={styles.subtitle}>Enter player names</Text>
        {playerNames.map((name, index) => (
          <TextInput
            key={index}
            style={styles.input}
            placeholder={`Player ${index + 1}`}
            value={name || `Player ${index + 1}`}
            onChangeText={(text) => {
              const newNames = [...playerNames];
              newNames[index] = text;
              setPlayerNames(newNames);
            }}
          />
        ))}

        <Button title="Start Tournament" onPress={startTournament} />
      </View>
    );
  }

  const currentRound = rounds[currentRoundIndex];

  return (
    <View style={styles.container}>
      {isDone && <Button title="Reset Tournament" onPress={() => {
        setStep(1);
        setRacers([]);
        setRounds([]);
        setCurrentRoundIndex(0);
      }} />}

      {isDone ? (
        <View>
          <Text style={styles.roundTitle}>🏆 Final Standings</Text>
          {finalStandings.map((racer, i) => (
            <Text key={racer.name}>
              {i + 1}. {racer.name} - {racer.wins} wins (OMW: {
                racer.opponents.reduce((sum, name) => sum + (racers.find(r => r.name === name)?.wins || 0), 0)
              })
            </Text>
          ))}
        </View>
      ) : (
        <View>
          {currentRound.matches.map((match, index) => (
            <View key={index} style={styles.matchContainer}>
              <Text style={styles.matchTitle}>Match {index + 1}</Text>
              {match.racers.map((racer) => (
                <TouchableOpacity
                  key={racer}
                  style={[styles.playerButton, match.winner === racer && styles.winnerButton]}
                  onPress={() => handleWinnerSelect(index, racer)}
                >
                  <Text>{racer}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}
          <Text style={styles.roundTitle}>Round {currentRound.number} of {roundCount}</Text>

          <Text style={styles.roundTitle}>Current Standings</Text>
          {[...racers].sort((a, b) => b.wins - a.wins).map((r, i) => (
            <Text key={r.name}>{i + 1}. {r.name} - {r.wins} wins</Text>
          ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 16,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  roundTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  matchContainer: {
    marginBottom: 16,
  },
  matchTitle: {
    fontSize: 18,
    marginBottom: 4,
  },
  playerButton: {
    padding: 10,
    marginVertical: 4,
    backgroundColor: '#ddd',
    borderRadius: 6,
  },
  winnerButton: {
    backgroundColor: '#90ee90',
  },
});

export default RaceScreen;
