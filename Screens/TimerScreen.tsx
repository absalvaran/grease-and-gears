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
  Switch
} from 'react-native';
import { Picker } from '@react-native-picker/picker';

function formatTime(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  const milliseconds = ms % 1000;
  return `${minutes}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}`;
}

export default function TimerScreen() {
  const [isTimeAttack, setIsTimeAttack] = useState(true);

  // TimeAttack State
  const [timeAttackTimer, setTimeAttackTimer] = useState(0);
  const [isTimeAttackRunning, setIsTimeAttackRunning] = useState(false);
  const [splits, setSplits] = useState<number[]>([]);
  const timeAttackRef = useRef<NodeJS.Timeout | null>(null);

  // Race State
  const [timers, setTimers] = useState<number[]>([0, 0]);
  const [running, setRunning] = useState<boolean[]>([false, false]);

  // Shared State
  const [note, setNote] = useState('');
  const [setup, setSetup] = useState('');
  const [battery, setBattery] = useState('');
  const [gears, setGears] = useState('');
  const [runName, setRunName] = useState('');
  const [runs, setRuns] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [currentSession, setCurrentSession] = useState('');
  const [namePromptVisible, setNamePromptVisible] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [selected, setSelected] = useState<any | null>(null);
  const [detailsVisible, setDetailsVisible] = useState(false);

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
    const raceInterval = setInterval(() => {
      setTimers(prevTimers =>
        prevTimers.map((time, idx) => (running[idx] ? time + 100 : time))
      );
    }, 100);
    return () => clearInterval(raceInterval);
  }, [running]);

  const toggleMode = () => {
    setIsTimeAttack(!isTimeAttack);
  };

  const startTimeAttack = () => {
    setIsTimeAttackRunning(true);
  };

  const stopTimeAttack = () => {
    setIsTimeAttackRunning(false);
  };

  const resetTimeAttack = () => {
    setIsTimeAttackRunning(false);
    setTimeAttackTimer(0);
    setSplits([]);
  };

  const addSplit = () => {
    setSplits([...splits, timeAttackTimer]);
  };

  const startRace = () => {
    setRunning([true, true]);
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
    const run = {
      name: runName,
      note,
      setup,
      battery,
      gears,
      mode: isTimeAttack ? 'timeattack' : 'race',
      time: isTimeAttack ? timeAttackTimer : timers,
      splits: isTimeAttack ? splits : undefined,
      session: currentSession || null
    };
    setRuns([...runs, run]);
    setNamePromptVisible(false);
    setDrawerVisible(true);
    if (isTimeAttack) resetTimeAttack();
    else resetRace();
  };

  return (
    <>
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
        <Text style={{ marginRight: 8 }}>Time Attack</Text>
        <Switch value={isTimeAttack} onValueChange={toggleMode} />
        <Text style={{ marginLeft: 8 }}>Race</Text>
      </View>

      {isTimeAttack ? (
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>Time Attack</Text>
          <Text style={{ fontSize: 32, fontWeight: 'bold' }}>{formatTime(timeAttackTimer)}</Text>
          <Button title="Start" onPress={startTimeAttack} disabled={isTimeAttackRunning} />
          <Button title="Stop" onPress={stopTimeAttack} disabled={!isTimeAttackRunning} />
          <Button title="Split" onPress={addSplit} disabled={!isTimeAttackRunning} />
          <Button title="Reset" onPress={resetTimeAttack} />

          {splits.length > 0 && (
            <View style={{ marginTop: 12 }}>
              <Text>Splits:</Text>
              {splits.map((s, i) => (
                <Text key={i}>{i + 1}. {formatTime(s)}</Text>
              ))}
            </View>
          )}
        </View>
      ) : (
        <View>
          <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Race</Text>
          <Button title="Start Race" onPress={startRace} disabled={running.some(r => r)} />
          {timers.map((time, index) => (
            <View key={index} style={{ marginBottom: 12 }}>
              <Text style={{ fontSize: index === 0 ? 28 : 20 }}>
                {index === 0 ? 'Lead Timer' : `Lane ${index + 1}`}: {formatTime(time)}
              </Text>
              <Button title="Stop" onPress={() => stopLane(index)} disabled={!running[index]} />
            </View>
          ))}
          <Button title="Reset Race" onPress={resetRace} />
        </View>
      )}

      <View style={{ borderWidth: 1, borderRadius: 8, padding: 8, marginVertical: 16 }}>
        <TextInput
          placeholder="Notes"
          value={note}
          onChangeText={setNote}
          multiline
          numberOfLines={3}
          style={{ borderBottomWidth: 1, paddingBottom: 8, marginBottom: 8, color: 'black' }}
        />

        <Pressable onPress={() => setDetailsVisible(!detailsVisible)}>
          <Text style={{ fontWeight: 'bold', color: 'gray' }}>More details {detailsVisible ? '▲' : '▼'}</Text>
        </Pressable>

        {detailsVisible && (
          <View style={{ marginTop: 8 }}>
            <TextInput
              placeholder="Setup"
              value={setup}
              onChangeText={setSetup}
              style={{ borderBottomWidth: 1, marginBottom: 8 }}
            />
            <TextInput
              placeholder="Battery"
              value={battery}
              onChangeText={setBattery}
              style={{ borderBottomWidth: 1, marginBottom: 8 }}
            />
            <Text style={{ marginBottom: 4 }}>Gear Ratio</Text>
            <Picker
              selectedValue={gears}
              onValueChange={(value) => setGears(value)}
              style={{ height: 40 }}
            >
              <Picker.Item label="Select gear ratio" value="" />
              {['3.5', '3.7', '4.1', '4.2', '5'].map(r => (
                <Picker.Item key={r} label={r} value={r} />
              ))}
            </Picker>
            
          </View>
        )}
      </View>

      <Button title="Save Run" onPress={handleSavePrompt} disabled={isTimeAttack ? isTimeAttackRunning : !allStopped} />
      <Button title="View Saved Runs" onPress={() => setDrawerVisible(true)} />
    <Modal visible={namePromptVisible} transparent animationType="fade">
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
      <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Enter run name</Text>
      <TextInput
        placeholder="Run name"
        value={runName}
        onChangeText={setRunName}
        style={{ borderBottomWidth: 1, marginBottom: 12 }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
        <Pressable onPress={() => setNamePromptVisible(false)} style={{ marginRight: 16 }}>
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
      <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 12 }}>Run Details</Text>
      <Text style={{ fontWeight: 'bold' }}>Name:</Text>
      <Text>{selected.name}</Text>
      <Text style={{ fontWeight: 'bold' }}>Mode:</Text>
      <Text>{selected.mode}</Text>
      <Text style={{ fontWeight: 'bold' }}>Session:</Text>
      <Text>{selected.session || 'None'}</Text>
      <Text style={{ fontWeight: 'bold' }}>Time:</Text>
      {Array.isArray(selected.time) ? (
        selected.time.map((t, i) => (
          <Text key={i}>{i === 0 ? 'Lead' : `Lane ${i + 1}`}: {formatTime(t)}</Text>
        ))
      ) : (
        <Text>{formatTime(selected.time)}</Text>
      )}
      {selected.splits && (
        <>
          <Text style={{ fontWeight: 'bold', marginTop: 8 }}>Splits:</Text>
          {selected.splits.map((s, i) => (
            <Text key={i}>{i + 1}. {formatTime(s)}</Text>
          ))}
        </>
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

</ScrollView>

<Modal visible={drawerVisible} transparent animationType="slide">
  <View style={{ flex: 1, backgroundColor: 'white', padding: 16 }}>
    <Text style={{ fontWeight: 'bold', fontSize: 18, marginBottom: 12 }}>Saved Runs</Text>
    <FlatList
      data={runs}
      keyExtractor={(item, index) => index.toString()}
      renderItem={({ item, index }) => (
        <TouchableOpacity
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
                    setRuns(prev => prev.filter((_, i) => i !== index));
                  }
                }
              ]
            );
          }}
          style={{ padding: 12, borderBottomWidth: 1, borderColor: '#ccc' }}
        >
          <Text>{item.name}</Text>
          <Text style={{ fontSize: 12, color: 'gray' }}>{item.mode} — {item.session || 'No session'}</Text>
        </TouchableOpacity>
      )}
    />
    <Button title="Close" onPress={() => setDrawerVisible(false)} />
  </View>
</Modal>

<Modal visible={namePromptVisible} transparent animationType="fade">
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)' }}>
    <View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, width: '80%' }}>
      <Text style={{ marginBottom: 10, fontWeight: 'bold' }}>Enter run name</Text>
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
        <Pressable onPress={() => setNamePromptVisible(false)} style={{ marginRight: 16 }}>
          <Text style={{ color: 'gray' }}>Cancel</Text>
        </Pressable>
        <Pressable onPress={confirmSave}>
          <Text style={{ fontWeight: 'bold' }}>Save</Text>
        </Pressable>
      </View>
    </View>
  </View>
</Modal>
</>
  );
}
