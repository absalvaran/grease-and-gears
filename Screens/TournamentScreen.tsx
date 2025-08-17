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
import Container from '../Components/Container';
import { ScrollView } from 'react-native-gesture-handler';

const TournamentScreen = () => {
  const [step, setStep] = useState(1);
  const [playerCount, setPlayerCount] = useState(3);
  const [laneCount, setLaneCount] = useState(3);
  const [playerNames, setPlayerNames] = useState<string[]>([]);
  const [racers, setRacers] = useState<any[]>([]);
  const [rounds, setRounds] = useState<any[]>([]);
  const [currentRoundIndex, setCurrentRoundIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [finalStandings, setFinalStandings] = useState<any[]>([]);
  const derivedRounds = (players: number, lanes: number) =>
    Math.max(
      players,
      Math.ceil((players - 1) / Math.max(1, lanes - 1)),
    );
  const allNamesFilled = playerNames
    .slice(0, playerCount)
    .every(n => n && n.trim().length > 0);

  // Sync player name fields when player count changes
  useEffect(() => {
    setPlayerNames(prev =>
      Array.from({ length: playerCount }, (_, i) => prev[i] || ''),
    );
  }, [playerCount]);

  const startTournament = () => {
    if (!allNamesFilled) return;
    const finalNames = playerNames.map((name, i) =>
      name.trim() ? name.trim() : `Player ${i + 1}`,
    );

    const initialRacers = finalNames.map(name => ({
      name,
      wins: 0,
      opponents: [],
    }));

    // Build balanced round-robin schedule derived from n racers and m lanes
    const schedule = buildBalancedSchedule(initialRacers, laneCount);

    setRacers(initialRacers);
    setRounds(schedule);
    setCurrentRoundIndex(0);
    setStep(2);
  };

  // Balanced round-robin schedule generator derived from n racers and m lanes.
  // Rounds needed = max(n, ceil((n-1)/(m-1))) to give each racer at least n races (one per round).
  // If n % lanes === 1, there will be exactly one solo bracket per round; rotate who is solo so all racers get a solo round.
  const buildBalancedSchedule = (racersList: any[], laneSize: number) => {
    const names = racersList.map(r => r.name);
    const n = names.length;
    const roundsNeeded = Math.max(
      n,
      Math.ceil((n - 1) / Math.max(1, laneSize - 1)),
    );

    // Track seen pairs
    const seen = new Set<string>();
    const key = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`);

    const roundsBuilt: any[] = [];
    const needsSolo = n % laneSize === 1;

    for (let roundIdx = 0; roundIdx < roundsNeeded; roundIdx++) {
      const remaining = new Set(names);
      const heats: any[] = [];

      // Choose rotating solo but defer adding until after first full group is formed
      let soloDeferred: string | null = null;
      if (needsSolo && remaining.size > 0) {
        const solo = names[roundIdx % n];
        if (remaining.has(solo)) {
          soloDeferred = solo;
          remaining.delete(solo);
        }
      }

      let firstGroupMade = false;
      while (remaining.size > 0) {
        const group: string[] = [];
        // pick the next seed deterministically
        const seed = Array.from(remaining)[0];
        group.push(seed);
        remaining.delete(seed);

        // Fill group up to laneSize, preferring players with no pair conflicts
        while (group.length < laneSize && remaining.size > 0) {
          const candidates = Array.from(remaining);
          // Score candidate by number of conflicts with current group
          let best: string | null = null;
          let bestScore = Infinity;
          for (const c of candidates) {
            let conflicts = 0;
            for (const g of group) {
              if (seen.has(key(c, g))) conflicts++;
            }
            if (conflicts < bestScore) {
              bestScore = conflicts;
              best = c;
              if (bestScore === 0) break;
            }
          }

          // Accept best candidate (even if conflict unavoidable)
          if (best) {
            group.push(best);
            remaining.delete(best);
          } else {
            break;
          }
        }

        heats.push({ racers: group, winner: null });
        // After the first group, insert the solo (if any) to ensure first heat is full bracket
        if (!firstGroupMade) {
          firstGroupMade = true;
          if (soloDeferred) {
            heats.push({ racers: [soloDeferred], winner: null });
            soloDeferred = null;
          }
        }
        // Register pairs from this group
        for (let i = 0; i < group.length; i++) {
          for (let j = i + 1; j < group.length; j++) {
            seen.add(key(group[i], group[j]));
          }
        }
      }

      // Edge case: if there were no groups (should not happen) and solo is deferred, add it
      if (soloDeferred) {
        heats.push({ racers: [soloDeferred], winner: null });
      }

      roundsBuilt.push({ number: roundIdx + 1, heats });
    }

    return roundsBuilt;
  };

  const handleWinnerSelect = (heatIndex: number, winnerName: string) => {
    const updatedRounds = [...rounds];
    const round = updatedRounds[currentRoundIndex];
    round.heats[heatIndex].winner = winnerName;
    setRounds(updatedRounds);
  };

  const canConfirmCurrentRound = () => {
    const round = rounds[currentRoundIndex];
    if (!round) return false;
    return round.heats.every((h: any) => h.winner);
  };

  const computeUpdatedRacersFromRound = (round: any, racersToUpdate: any[]) => {
    const updatedRacers = racersToUpdate.map(racer => {
      const heatPlayed = round.heats.find((h: any) => h.racers.includes(racer.name));
      if (!heatPlayed) return racer;
      const playedOpponents = heatPlayed.racers.filter((r: string) => r !== racer.name && r !== 'BYE');
      const didWin = heatPlayed.winner === racer.name;
      return {
        ...racer,
        wins: didWin ? racer.wins + 1 : racer.wins,
        opponents: [...racer.opponents, ...playedOpponents],
      };
    });
    return updatedRacers;
  };

  const onConfirmRound = () => {
    const round = rounds[currentRoundIndex];
    if (!round || !canConfirmCurrentRound()) return;

    const updatedRacers = computeUpdatedRacersFromRound(round, racers);
    setRacers(updatedRacers);

    const isLastRound = currentRoundIndex + 1 >= rounds.length;
    if (!isLastRound) {
      setCurrentRoundIndex(prev => prev + 1);
    } else {
      // Compute final standings and show completion
      const standings = [...updatedRacers].sort((a, b) => {
        if (b.wins !== a.wins) return b.wins - a.wins;
        const omw = (r: any) =>
          r.opponents.reduce(
            (sum: number, name: string) => sum + (updatedRacers.find(rr => rr.name === name)?.wins || 0),
            0,
          );
        return omw(b) - omw(a);
      });
      setFinalStandings(standings);
      setIsCompleted(true);
    }
  };

  const isDone = isCompleted;

  const resetTournament = () => {
    setStep(1);
    setRacers([]);
    setRounds([]);
    setCurrentRoundIndex(0);
    setIsCompleted(false);
    setFinalStandings([]);
  };

  if (step === 1) {
    return (
      <Container>
        <ScrollView style={styles.container}>
          <Text style={styles.title}>Tournament Setup</Text>

          <Text style={styles.subtitle}>Number of players</Text>
          <Picker selectedValue={playerCount} onValueChange={setPlayerCount}>
            {[...Array(8)].map((_, i) => (
              <Picker.Item key={i} label={`${i + 3}`} value={i + 3} />
            ))}
          </Picker>

          <Text style={styles.subtitle}>Rounds (derived)</Text>
          <Text>
            {derivedRounds(playerCount, laneCount)} round
            {derivedRounds(playerCount, laneCount) !== 1 ? 's' : ''}
          </Text>

          <Text style={styles.subtitle}>Lane count</Text>
          <Picker selectedValue={laneCount} onValueChange={setLaneCount}>
            <Picker.Item label="3 Lanes" value={3} />
            <Picker.Item label="5 Lanes" value={5} />
          </Picker>

          <Text style={styles.subtitle}>Player Names</Text>
          {Array.from({ length: playerCount }, (_, i) => (
            <TextInput
              key={i}
              style={styles.input}
              placeholder={`Player ${i + 1}`}
              value={playerNames[i] || ''}
              onChangeText={text => {
                const updated = [...playerNames];
                updated[i] = text;
                setPlayerNames(updated);
              }}
            />
          ))}
          <Button
            title="Clear Names"
            onPress={() => setPlayerNames(Array.from({ length: playerCount }, () => ''))}
          />
          {!allNamesFilled && (
            <Text style={{ color: 'crimson', marginBottom: 8 }}>
              Please enter all racer names to proceed.
            </Text>
          )}
          <Button title="Start Tournament" onPress={startTournament} disabled={!allNamesFilled} />
        </ScrollView>
      </Container>
    );
  }

  const currentRound = rounds[currentRoundIndex];

  return (
    <Container>
      <ScrollView style={styles.container}>
        {isDone ? (
          <View>
            <Button title="Reset Tournament" onPress={resetTournament} />
            <Text style={styles.roundTitle}>🏆 Final Standings</Text>
            {finalStandings.map((racer, i) => (
              <Text key={racer.name}>
                {i + 1}. {racer.name} - {racer.wins} wins
              </Text>
            ))}
          </View>
        ) : (
          <View>
            {currentRound?.heats.map((heat: any, index: number) => (
              <View key={index} style={styles.heatContainer}>
                <Text style={styles.heatTitle}>Heat {index + 1}</Text>
                {heat.racers.map((racer: string) => (
                  <TouchableOpacity
                    key={racer}
                    style={[
                      styles.playerButton,
                      heat.winner === racer && styles.winnerButton,
                    ]}
                    onPress={() => handleWinnerSelect(index, racer)}
                  >
                    <Text>{racer}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            ))}

            <Text style={styles.roundTitle}>
              Round {currentRound?.number} of {rounds.length}
            </Text>

            <Button
              title={currentRoundIndex + 1 >= rounds.length ? 'Confirm Final Round' : 'Confirm Round'}
              onPress={onConfirmRound}
              disabled={!canConfirmCurrentRound()}
            />

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
      </ScrollView>
    </Container>
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
  },
  heatContainer: {
    marginBottom: 16,
  },
  heatTitle: {
    fontSize: 16,
    fontWeight: '600',
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

export default TournamentScreen;
