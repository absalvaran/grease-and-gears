import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

const RaceScreen = () => {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(3);
  const [roundCount, setRoundCount] = useState(3);
  const [laneCount, setLaneCount] = useState(3);
  const [playerNames, setPlayerNames] = useState([]);
  const [racers, setRacers] = useState([]);
  const [rounds, setRounds] = useState([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);

  // Sync player name fields when player count changes
  useEffect(() => {
    setPlayerNames(prev =>
      Array.from({ length: playerCount }, (_, i) => prev[i] || ''),
    );
  }, [playerCount]);

  const startTournament = () => {
    const finalNames = playerNames.map((name, i) =>
      name.trim() ? name.trim() : `Player ${i + 1}`,
    );

    const initialRacers = finalNames.map(name => ({
      name,
      wins: 0,
      opponents: [],
    }));

    const firstRound = generateSwissMatches(initialRacers, laneCount);

    setRacers(initialRacers);
    setRounds([{ number: 1, matches: firstRound }]);
    setCurrentRoundIndex(0);
    setStep(2);
  };

  const generateSwissMatches = (racersList, laneSize) => {
    const shuffled = [...racersList].sort(() => Math.random() - 0.5);
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
    c;
    if (roundCount <= matchIndex) {
      setTimeout(() => {
        const updatedRacers = racers.map(racer => {
          const matchWon = round.matches.find(m => m.winner === racer.name);
          const playedOpponents = round.matches
            .filter(m => m.racers.includes(racer.name))
            .flatMap(m => m.racers.filter(r => r !== racer.name));

          return matchWon
            ? {
                ...racer,
                wins: racer.wins + 1,
                opponents: [...racer.opponents, ...playedOpponents],
              }
            : {
                ...racer,
                opponents: [...racer.opponents, ...playedOpponents],
              };
        });

        setRacers(updatedRacers);

        if (currentRoundIndex + 1 < roundCount) {
          const nextMatches = generateSwissMatches(updatedRacers, laneCount);
          setRounds(prev => [
            ...prev,
            { number: currentRoundIndex + 2, matches: nextMatches },
          ]);
          setCurrentRoundIndex(prev => prev + 1);
        } else {
          setCurrentRoundIndex(prev => prev + 1); // triggers final standings
        }
      }, 300);
    }
  };

  const isDone =
    currentRoundIndex === roundCount &&
    rounds[roundCount - 1]?.matches.every(m => m.winner !== null);

  const finalStandings = [...racers].sort((a, b) => {
    if (b.wins !== a.wins) return b.wins - a.wins;

    const omw = r =>
      r.opponents.reduce(
        (sum, name) => sum + (racers.find(r => r.name === name)?.wins || 0),
        0,
      );

    return omw(b) - omw(a);
  });

  if (step === 1) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Swiss Tournament Setup</Text>

        <Text style={styles.subtitle}>Number of players</Text>
        <Picker selectedValue={playerCount} onValueChange={setPlayerCount}>
          {[...Array(8)].map((_, i) => (
            <Picker.Item key={i} label={`${i + 3}`} value={i + 3} />
          ))}
        </Picker>

        <Text style={styles.subtitle}>Number of rounds</Text>
        <Picker selectedValue={roundCount} onValueChange={setRoundCount}>
          {[...Array(8)].map((_, i) => (
            <Picker.Item key={i} label={`${i + 3}`} value={i + 3} />
          ))}
        </Picker>

        <Text style={styles.subtitle}>Lane count</Text>
        <Picker selectedValue={laneCount} onValueChange={setLaneCount}>
          <Picker.Item label="3 Lanes" value={3} />
          <Picker.Item label="5 Lanes" value={5} />
        </Picker>

        <Text style={styles.subtitle}>Player Names</Text>
        {playerNames.map((name, i) => (
          <TextInput
            key={i}
            style={styles.input}
            placeholder={`Player ${i + 1}`}
            value={name}
            onChangeText={text => {
              const updated = [...playerNames];
              updated[i] = text;
              setPlayerNames(updated);
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
      {isDone && (
        <Button
          title="Reset Tournament"
          onPress={() => {
            setStep(1);
            setRacers(3);
            setRounds(3);
            setCurrentRoundIndex(0);
            setPlayerNames([]);
          }}
        />
      )}

      {isDone ? (
        <View>
          <Text style={styles.roundTitle}>🏆 Final Standings</Text>
          {finalStandings.map((racer, i) => (
            <Text key={racer.name}>
              {i + 1}. {racer.name} - {racer.wins} wins
            </Text>
          ))}
        </View>
      ) : (
        <View>
          {currentRound?.matches.map((match, index) => (
            <View key={index} style={styles.matchContainer}>
              <Text style={styles.matchTitle}>Match {index + 1}</Text>
              {match.racers.map(racer => (
                <TouchableOpacity
                  key={racer}
                  style={[
                    styles.playerButton,
                    match.winner === racer && styles.winnerButton,
                  ]}
                  onPress={() => handleWinnerSelect(index, racer)}
                >
                  <Text>{racer}</Text>
                </TouchableOpacity>
              ))}
            </View>
          ))}

          <Text style={styles.roundTitle}>
            Round {currentRound?.number} of {roundCount}
          </Text>

          <Text style={styles.roundTitle}>Current Standings</Text>
          {[...racers]
            .sort((a, b) => b.wins - a.wins)
            .map((r, i) => (
              <Text key={r.name}>
                {i + 1}. {r.name} - {r.wins} wins
              </Text>
            ))}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 16 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subtitle: { fontSize: 18, marginTop: 16, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    marginVertical: 4,
    borderRadius: 4,
  },
  roundTitle: { fontSize: 20, fontWeight: 'bold', marginTop: 16 },
  matchContainer: { marginBottom: 16 },
  matchTitle: { fontSize: 16, fontWeight: '600' },
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
