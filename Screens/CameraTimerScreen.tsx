import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImageManipulator from 'expo-image-manipulator';

export default function CameraTimerScreen() {
  const cameraRef = useRef(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [laps, setLaps] = useState<number[]>([]);
  const [lastLapTime, setLastLapTime] = useState<number | null>(null);
  const [ledDetected, setLedDetected] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (permission?.granted) {
      interval = setInterval(detectLEDAndCheckSector, 1000); // 1 sec interval
    }

    return () => clearInterval(interval);
  }, [permission]);

  const detectLEDAndCheckSector = async () => {
    if (!cameraRef.current) return;

    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.2,
        skipProcessing: true,
      });

      const result = await ImageManipulator.manipulateAsync(
        photo.uri,
        [{ resize: { width: 50, height: 50 } }],
        { base64: true },
      );

      const bright = await scanBase64ForBrightness(result.base64 || '');
      if (bright) {
        const now = Date.now();
        if (!lastLapTime || now - lastLapTime > 1000) {
          setLastLapTime(now);
          setLaps(prev => [...prev, now]);
        }
        setLedDetected(true);
      } else {
        setLedDetected(false);
      }
    } catch (err) {
      console.warn('Failed to detect LED:', err);
    }
  };

  if (!permission?.granted) {
    return (
      <TouchableOpacity onPress={requestPermission}>
        <Text>Grant Camera Permission</Text>
      </TouchableOpacity>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView style={styles.camera} ref={cameraRef} />
      <View style={styles.overlay}>
        <Text style={styles.status}>
          {ledDetected ? '💡 LED Detected' : 'No LED'}
        </Text>
        <Text style={styles.title}>Lap Times:</Text>
        {laps.map((lap, i) => (
          <Text key={i} style={styles.lap}>
            Lap {i + 1}: {lap} ms
          </Text>
        ))}
      </View>
    </View>
  );
}

async function scanBase64ForBrightness(base64: string): Promise<boolean> {
  // Crude scan: if there’s a lot of "bright" pixels in base64 JPEG, guess yes
  let brightPixels = 0;
  let checked = 0;

  for (let i = 0; i < base64.length - 4; i += 4) {
    const char = base64.charCodeAt(i);
    if (char > 200) brightPixels++;
    checked++;
    if (checked > 1000) break; // only check a few pixels
  }

  return brightPixels > 10;
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    bottom: 40,
    left: 20,
  },
  status: {
    fontSize: 18,
    color: 'lime',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 20,
    marginTop: 20,
    color: '#fff',
  },
  lap: {
    color: '#fff',
    fontSize: 16,
  },
});
