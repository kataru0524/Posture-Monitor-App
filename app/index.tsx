import { useNavigation } from 'expo-router';
import React, { useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const navigation = useNavigation();

  const handleLogin = () => {
    // Implement login logic here
    console.log('Login', { username, password });
    
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Posture Monitor App</Text>
      <Button title="Login" onPress={() => {navigation.navigate('login')}} />
      <Button title="Register" onPress={() => {navigation.navigate('register')}} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 12,
    padding: 10,
  },
});