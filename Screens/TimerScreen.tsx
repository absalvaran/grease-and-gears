import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  Button,
  ScrollView,
  TextInput,
  Modal,
  Pressable,
  FlatList,
  TouchableOpacity,
  Alert,
  Switch,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Container from '../Components/Container';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Accordion from '../Components/Accordion';

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

interface RunInterface {
  name: string;
  mode: string;
  session: string;
  time: number | number[];
  note: string;
  setup: string;
  battery: string;
  gears: string;
}

type GroupedRunsType = {
  timeattack: Record<string, RunInterface[]>;
  race: Record<string, RunInterface[]>;
};

export default function TimerScreen() {
  const [isTimeAttack, setIsTimeAttack] = useState(true);

  const [timeAttackTimer, setTimeAttackTimer] = useState(0);
  const [isTimeAttackRunning, setIsTimeAttackRunning] = useState(false);
  const timeAttackRef = useRef<NodeJS.Timeout>(null);

  const [timers, setTimers] = useState([0, 0]);
  const [running, setRunning] = useState([false, false]);
  const raceRef = useRef<NodeJS.Timeout>(null);

  const [note, setNote] = useState('');
  const [setup, setSetup] = useState('');
  const [battery, setBattery] = useState('');
  const [gears, setGears] = useState('');
  const [runName, setRunName] = useState('');
  const [runs, setRuns] = useState<RunInterface[]>([]);
  const [currentSession, setCurrentSession] = useState('');
  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selected, setSelected] = useState<RunInterface | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [interactionModalVisible, setInteractionModalVisible] = useState(false);

  useEffect(() => {
    if (isTimeAttackRunning) {
      timeAttackRef.current = setInterval(() => {
        setTimeAttackTimer(prev => prev + 100);
      }, 100);
    } else {
      if (timeAttackRef.current) clearInterval(timeAttackRef.current);
    }
    return () => {
      if (timeAttackRef.current) clearInterval(timeAttackRef.current);
    };
  }, [isTimeAttackRunning]);

  useEffect(() => {
    if (running.some(r => r)) {
      raceRef.current = setInterval(() => {
        setTimers(prevTimers =>
          prevTimers.map((time, idx) => (running[idx] ? time + 100 : time)),
        );
      }, 100);
    } else {
      if (raceRef.current) clearInterval(raceRef.current);
    }
    return () => {
      if (raceRef.current) clearInterval(raceRef.current);
    };
  }, [running]);

  useEffect(() => {
    const loadRuns = async () => {
      try {
        const stored = await AsyncStorage.getItem('@runs');
        if (stored) {
          setRuns(JSON.parse(stored));
        }
      } catch (err) {
        console.error('Failed to load runs', err);
      }
    };
    loadRuns();
  }, []);

  useEffect(() => {
    const saveRuns = async () => {
      try {
        await AsyncStorage.setItem('@runs', JSON.stringify(runs));
      } catch (err) {
        console.error('Failed to save runs', err);
      }
    };
    saveRuns();
  }, [runs]);

  const toggleMode = () => {
    setIsTimeAttack(!isTimeAttack);
  };

  const startTimeAttack = () => {
    setIsTimeAttackRunning(true);
    setInteractionModalVisible(true);
  };

  const stopTimeAttack = () => {
    setIsTimeAttackRunning(false);
  };

  const resetTimeAttack = () => {
    setIsTimeAttackRunning(false);
    setTimeAttackTimer(0);
  };

  const startRace = () => {
    setRunning([true, true]);
    setInteractionModalVisible(true);
  };

  const stopLane = (index: number) => {
    setRunning(prev => prev.map((r, i) => (i === index ? false : r)));
  };

  const resetRace = () => {
    setTimers([0, 0]);
    setRunning([false, false]);
  };

  const allStopped = running.every(r => !r);

  const handleSavePrompt = () => {
    if (isTimeAttack && isTimeAttackRunning) return;
    if (!isTimeAttack && !allStopped) return;
    setNamePromptVisible(true);
  };

  const confirmSave = () => {
    if (!runName) return;
    const run: RunInterface = {
      name: runName,
      note,
      setup,
      battery,
      gears,
      mode: isTimeAttack ? 'timeattack' : 'race',
      time: isTimeAttack ? timeAttackTimer : timers,
      session: currentSession || '',
    };
    setRuns([...runs, run]);
    setNamePromptVisible(false);
    setRunName('');
    setCurrentSession('');
    setNote('');
    setSetup('');
    setBattery('');
    setGears('');
    if (isTimeAttack) resetTimeAttack();
    else resetRace();
  };

  const groupRunsByModeAndSession = (runs: RunInterface[]) => {
    const grouped: GroupedRunsType = {
      timeattack: {},
      race: {},
    };

    for (const run of runs) {
      const mode = run.mode as keyof GroupedRunsType;
      const session = run.session || 'No Session';
      if (!grouped[mode][session]) {
        grouped[mode][session] = [];
      }
      grouped[mode][session].push(run);
    }

    return grouped;
  };

  return (
    <Container>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 12,
          }}
        >
          <Text style={{ marginRight: 8 }}>Time Attack</Text>
          <Switch value={!isTimeAttack} onValueChange={toggleMode} />
          <Text style={{ marginLeft: 8 }}>Race</Text>
        </View>

        {isTimeAttack ? (
          <View>
            <Text style={{ fontSize: 32 }}>{formatTime(timeAttackTimer)}</Text>
            <Button
              title="Start"
              onPress={startTimeAttack}
              disabled={isTimeAttackRunning}
            />
            <Button
              title="Reset"
              onPress={resetTimeAttack}
              disabled={timeAttackTimer === 0}
            />
          </View>
        ) : (
          <View>
            {timers.map((time, index) => (
              <View key={index}>
                <Text style={{ fontSize: index === 0 ? 32 : 24 }}>
                  {index === 0 ? 'Lead Timer' : `Lag Timer`} -{' '}
                  {formatTime(time)}
                </Text>
              </View>
            ))}
            <Button
              title="Start Race"
              onPress={startRace}
              disabled={running.some(r => r)}
            />
            <Button
              title="Reset Race"
              onPress={resetRace}
              disabled={timers[0] === 0 && timers[1] === 0}
            />
          </View>
        )}

        <Button
          title="Save Run"
          onPress={handleSavePrompt}
          disabled={
            isTimeAttack
              ? timeAttackTimer === 0
              : timers[0] === 0 && timers[1] === 0
          }
        />
        <Button
          title="View Saved Runs"
          onPress={() => setDrawerVisible(true)}
        />

        <View
          style={{
            borderWidth: 1,
            borderRadius: 8,
            padding: 8,
            marginVertical: 16,
          }}
        >
          <TextInput
            placeholder="Notes"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={3}
            style={{
              borderBottomWidth: 1,
              paddingBottom: 8,
              marginBottom: 8,
              color: 'black',
            }}
            placeholderTextColor={'gray'}
          />

          {/* <Pressable onPress={() => setDetailsVisible(!detailsVisible)}>
            <Text style={{ fontWeight: 'bold', color: 'gray' }}>
              More details {detailsVisible ? '▲' : '▼'}
            </Text>
          </Pressable> */}

          <View style={{ marginTop: 8 }}>
            <TextInput
              placeholder="Setup"
              value={setup}
              onChangeText={setSetup}
              style={{ borderBottomWidth: 1, marginBottom: 8 }}
              placeholderTextColor={'gray'}
            />
            <TextInput
              placeholder="Battery"
              value={battery}
              onChangeText={setBattery}
              style={{ borderBottomWidth: 1, marginBottom: 8 }}
              placeholderTextColor={'gray'}
            />
            <Text style={{ marginBottom: 4 }}>Gear Ratio</Text>
            <Picker
              selectedValue={gears}
              onValueChange={value => setGears(value)}
              style={{ height: 60 }}
            >
              <Picker.Item label="Select gear ratio" value="" />
              {['3.5', '3.7', '4.1', '4.2', '5'].map(r => (
                <Picker.Item key={r} label={r} value={r} />
              ))}
            </Picker>
          </View>
        </View>
      </ScrollView>

      <Modal visible={interactionModalVisible} transparent animationType="fade">
        <Pressable
          onPress={() => {
            if (isTimeAttack) {
              stopTimeAttack();
              setInteractionModalVisible(false);
            } else {
              stopLane(!!running[0] ? 0 : 1);
              if (!running[0]) {
                setInteractionModalVisible(false);
              }
            }
          }}
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Text style={{ color: 'white', fontSize: 20 }}>
            Tap anywhere to stop
          </Text>
          {!isTimeAttack && (
            <Text style={{ color: 'white', fontSize: 20 }}>
              {running[0] ? 'LEAD' : 'LAG'}
            </Text>
          )}
        </Pressable>
      </Modal>

      <Modal visible={namePromptVisible} transparent animationType="fade">
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        >
          <View
            style={{
              backgroundColor: 'white',
              padding: 20,
              borderRadius: 10,
              width: '80%',
            }}
          >
            <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>
              Enter run name
            </Text>
            <TextInput
              placeholder="Run name"
              value={runName}
              onChangeText={setRunName}
              style={{ borderBottomWidth: 1, marginBottom: 12 }}
            />
            <TextInput
              placeholder="Session name (optional)"
              value={currentSession}
              onChangeText={setCurrentSession}
              style={{ borderBottomWidth: 1, marginBottom: 12 }}
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
              <Pressable
                onPress={() => setNamePromptVisible(false)}
                style={{ marginRight: 16 }}
              >
                <Text style={{ color: 'gray' }}>Cancel</Text>
              </Pressable>
              <Pressable onPress={confirmSave}>
                <Text style={{ fontWeight: 'bold' }}>Save</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {selected && (
        <Modal visible={!!selected} transparent animationType="slide">
          <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
            <Text
              style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}
            >
              Run Details
            </Text>
            <Text style={{ fontWeight: 'bold' }}>Name:</Text>
            <Text>{selected.name}</Text>

            <Text style={{ fontWeight: 'bold' }}>Mode:</Text>
            <Text>{selected.mode}</Text>

            <Text style={{ fontWeight: 'bold' }}>Session:</Text>
            <Text>{selected.session || 'None'}</Text>

            <Text style={{ fontWeight: 'bold' }}>Time:</Text>
            {Array.isArray(selected.time) ? (
              selected.time.map((t, i) => (
                <Text key={i}>
                  {i === 0 ? 'Lead' : `Lag`}: {formatTime(t)}
                </Text>
              ))
            ) : (
              <Text>{formatTime(selected.time)}</Text>
            )}

            <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Notes:</Text>
            <Text>{selected.note || 'None'}</Text>

            <Text style={{ fontWeight: 'bold' }}>Setup:</Text>
            <Text>{selected.setup || 'None'}</Text>

            <Text style={{ fontWeight: 'bold' }}>Battery:</Text>
            <Text>{selected.battery || 'None'}</Text>

            <Text style={{ fontWeight: 'bold' }}>Gears:</Text>
            <Text>{selected.gears || 'None'}</Text>

            <Button title="Close" onPress={() => setSelected(null)} />
          </View>
        </Modal>
      )}

      <Modal visible={drawerVisible} transparent animationType="slide">
        <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
          <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>
            Saved Runs
          </Text>

          <ScrollView>
            {Object.entries(groupRunsByModeAndSession(runs)).map(
              ([modeKey, sessions]) => (
                <View key={modeKey} style={{ marginBottom: 16 }}>
                  <Text
                    style={{
                      fontSize: 20,
                      fontWeight: 'bold',
                      marginBottom: 8,
                      color: '#333',
                    }}
                  >
                    {modeKey === 'timeattack' ? 'Time Attack' : 'Race'}
                  </Text>
                  {Object.entries(sessions).map(
                    ([sessionName, sessionRuns]) => (
                      <View key={sessionName} style={{ marginBottom: 12 }}>
                        <Accordion title={sessionName} defaultExpanded>
                          {sessionRuns.map(
                            (item: RunInterface, index: number) => (
                              <TouchableOpacity
                                key={`${item.name}-${index}`}
                                onPress={() => setSelected(item)}
                                onLongPress={() => {
                                  Alert.alert(
                                    'Delete Run',
                                    'Are you sure you want to delete this run?',
                                    [
                                      { text: 'Cancel', style: 'cancel' },
                                      {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: () => {
                                          setRuns(prev =>
                                            prev.filter(
                                              (_, i) =>
                                                i !== runs.indexOf(item),
                                            ),
                                          );
                                        },
                                      },
                                    ],
                                  );
                                }}
                                style={{
                                  paddingVertical: 8,
                                  paddingHorizontal: 12,
                                  borderBottomWidth: 1,
                                  borderColor: '#ddd',
                                  marginLeft: 16,
                                }}
                              >
                                <Text style={{ fontSize: 14 }}>
                                  {item.name}
                                </Text>
                                <Text style={{ fontSize: 12, color: 'gray' }}>
                                  {formatTime(
                                    Array.isArray(item.time)
                                      ? item.time[0]
                                      : item.time,
                                  )}
                                </Text>
                              </TouchableOpacity>
                            ),
                          )}
                        </Accordion>
                      </View>
                    ),
                  )}
                </View>
              ),
            )}
          </ScrollView>

          <Button title="Close" onPress={() => setDrawerVisible(false)} />
        </View>
      </Modal>
    </Container>
  );
}
