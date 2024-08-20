import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Button, StyleSheet, ScrollView, Dimensions } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import DateTimePicker from 'react-native-modal-datetime-picker';

const screenWidth = Dimensions.get('window').width;

export default function SensorMonitorScreen() {
  const [sensorData1, setSensorData1] = useState([]);
  const [sensorData2, setSensorData2] = useState([]);
  const [isGraphPaused, setIsGraphPaused] = useState(false);
  const [isDatePickerVisible, setIsDatePickerVisible] = useState(false);
  const [alarmCount, setAlarmCount] = useState(0);
  const [appRunningTime, setAppRunningTime] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('white');
  const dataGenerationInterval = useRef(null);
  const alarmTimeout = useRef(null);
  const scrollViewRef = useRef(null);
  const [autoScroll, setAutoScroll] = useState(true);

  useEffect(() => {
    const runningTimeInterval = setInterval(() => {
      setAppRunningTime((prevTime) => prevTime + 1);
    }, 1000);

    startDataGeneration();

    return () => {
      clearInterval(runningTimeInterval);
      if (dataGenerationInterval.current) clearInterval(dataGenerationInterval.current);
      if (alarmTimeout.current) clearTimeout(alarmTimeout.current);
    };
  }, []);

  const startDataGeneration = () => {
    dataGenerationInterval.current = setInterval(() => {
      if (!isGraphPaused) generateRandomData();
    }, 1000);
  };

  const generateRandomData = () => {
    const newData1 = Math.floor(Math.random() * 100);
    const newData2 = Math.floor(Math.random() * 100);

    setSensorData1((prevData) => [...prevData, newData1]);
    setSensorData2((prevData) => [...prevData, newData2]);
    checkForAlarms([newData1], [newData2]);
  };

  const checkForAlarms = (data1, data2) => {
    const threshold = 80;
    const alarms = [...data1, ...data2].filter((value) => value > threshold).length;

    if (alarms > 0) {
      setAlarmCount((prevCount) => prevCount + alarms);
      setBackgroundColor('red');
      if (alarmTimeout.current) clearTimeout(alarmTimeout.current);
      alarmTimeout.current = setTimeout(() => {
        setBackgroundColor('white');
      }, 5000);
    }
  };

  const toggleGraphPause = () => {
    setIsGraphPaused(!isGraphPaused);
  };

  const handleDatePicked = (date) => {
    const durationInSeconds = date.getMinutes() * 60 + date.getSeconds();
    setIsDatePickerVisible(false);

    setIsGraphPaused(true);
    setTimeout(() => {
      setIsGraphPaused(false);
    }, durationInSeconds * 1000);
  };

  useEffect(() => {
    if (autoScroll && scrollViewRef.current) {
      scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [sensorData1, sensorData2, autoScroll]);

  const handleScroll = (event) => {
    const { contentOffset, contentSize, layoutMeasurement } = event.nativeEvent;
    const isScrolledToEnd = contentOffset.x + layoutMeasurement.width >= contentSize.width - 10;
    setAutoScroll(isScrolledToEnd);
  };

  const yAxisLabels = () => {
    const maxValue = 100; // Assuming the max value for the random data is 100
    const interval = 20;
    const labels = [];
    for (let i = 0; i <= maxValue; i += interval) {
      labels.push(<Text key={i} style={styles.yAxisLabel}>{i}</Text>);
    }
    return labels.reverse();
  };

  return (
    <View style={[styles.container, { backgroundColor: backgroundColor }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Sensor Data Monitor</Text>
        <Text>App Running Time: {appRunningTime} seconds</Text>
      </View>
      <View style={styles.controlPanel}>
        <Button title="Generate Data" onPress={generateRandomData} />
        <Button title={isGraphPaused ? "Resume Graph" : "Pause Graph"} onPress={toggleGraphPause} />
        <Button title="Pause for..." onPress={() => setIsDatePickerVisible(true)} />
        <DateTimePicker
          isVisible={isDatePickerVisible}
          mode="time"
          onConfirm={handleDatePicked}
          onCancel={() => setIsDatePickerVisible(false)}
        />
      </View>
      <View style={styles.alarmInfo}>
        <Text>Total Alarms: {alarmCount}</Text>
      </View>
      <View style={styles.chartContainer}>
        <View style={styles.yAxisContainer}>
          {yAxisLabels()}
        </View>
        <ScrollView
          horizontal
          ref={scrollViewRef}
          onScroll={handleScroll}
          scrollEventThrottle={16}
        >
          <LineChart
            data={{
              labels: sensorData1.map((_, index) => index.toString()),
              datasets: [
                {
                  data: sensorData1,
                  strokeWidth: 2,
                  color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`,
                },
                {
                  data: sensorData2,
                  strokeWidth: 2,
                  color: (opacity = 1) => `rgba(244, 67, 54, ${opacity})`,
                },
              ],
            }}
            width={Math.max(screenWidth, sensorData1.length * 50)} // Dynamic width based on data length
            height={220}
            yAxisInterval={1}
            chartConfig={{
              backgroundColor: '#e26a00',
              backgroundGradientFrom: '#fb8c00',
              backgroundGradientTo: '#ffa726',
              decimalPlaces: 2, // optional, defaults to 2dp
              color: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
              style: {
                borderRadius: 16,
              },
            }}
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </ScrollView>
      </View>
      <View style={styles.legendContainer}>
        <Text style={{ color: 'rgba(134, 65, 244, 1)' }}>● Sensor 1</Text>
        <Text style={{ color: 'rgba(244, 67, 54, 1)' }}>● Sensor 2</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  controlPanel: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  alarmInfo: {
    alignItems: 'center',
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  yAxisContainer: {
    justifyContent: 'space-between',
    height: 220,
  },
  yAxisLabel: {
    fontSize: 10,
    color: 'grey',
  },
  legendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
});