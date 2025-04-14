/**
 * LED Controller App
 * Login Screen Component (React Native Firebase Version)
 */

import React, { useState, useEffect } from 'react';
import {
    View,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    SafeAreaView,
    KeyboardAvoidingView,
    Platform,
    ScrollView
} from 'react-native';
import auth from '@react-native-firebase/auth';

const LoginScreen = ({ navigation }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isRegistering, setIsRegistering] = useState(false);

    // Handle email/password login
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Login Error', 'Please enter both email and password');
            return;
        }

        setIsLoading(true);
        try {
            await auth().signInWithEmailAndPassword(email, password);
            // Navigation is handled by the auth state listener in App.js
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert(
                'Login Failed',
                error.message || 'Please check your credentials and try again'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle anonymous login
    const handleAnonymousLogin = async () => {
        setIsLoading(true);
        try {
            await auth().signInAnonymously();
            console.log('Anonymous login successful');
            // Navigation is handled by the auth state listener in App.js
        } catch (error) {
            console.error('Anonymous login error:', error);
            Alert.alert(
                'Login Failed',
                error.message || 'Unable to log in anonymously. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Handle registration
    const handleRegister = async () => {
        if (!email || !password) {
            Alert.alert('Registration Error', 'Please enter both email and password');
            return;
        }

        if (password.length < 6) {
            Alert.alert('Registration Error', 'Password must be at least 6 characters');
            return;
        }

        setIsLoading(true);
        try {
            await auth().createUserWithEmailAndPassword(email, password);
            Alert.alert('Success', 'Your account has been created successfully');
            // Navigation is handled by the auth state listener in App.js
        } catch (error) {
            console.error('Registration error:', error);
            Alert.alert(
                'Registration Failed',
                error.message || 'Unable to create account. Please try again.'
            );
        } finally {
            setIsLoading(false);
        }
    };

    // Toggle between login and register modes
    const toggleMode = () => {
        setIsRegistering(!isRegistering);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.container}
            >
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>LED Controller</Text>
                        <Text style={styles.subtitle}>
                            {isRegistering ? 'Create a new account' : 'Sign in to your account'}
                        </Text>
                    </View>

                    <View style={styles.form}>
                        <TextInput
                            style={styles.input}
                            placeholder="Email"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                            autoComplete="email"
                        />

                        <TextInput
                            style={styles.input}
                            placeholder="Password"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                            autoCapitalize="none"
                            autoComplete="password"
                        />

                        <TouchableOpacity
                            style={styles.button}
                            onPress={isRegistering ? handleRegister : handleLogin}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" size="small" />
                            ) : (
                                <Text style={styles.buttonText}>
                                    {isRegistering ? 'Register' : 'Login'}
                                </Text>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={toggleMode}
                            disabled={isLoading}
                        >
                            <Text style={styles.secondaryButtonText}>
                                {isRegistering
                                    ? 'Already have an account? Login'
                                    : 'Need an account? Register'}
                            </Text>
                        </TouchableOpacity>

                        <View style={styles.divider}>
                            <View style={styles.dividerLine} />
                            <Text style={styles.dividerText}>OR</Text>
                            <View style={styles.dividerLine} />
                        </View>

                        <TouchableOpacity
                            style={styles.anonymousButton}
                            onPress={handleAnonymousLogin}
                            disabled={isLoading}
                        >
                            <Text style={styles.anonymousButtonText}>Continue as Guest</Text>
                        </TouchableOpacity>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: 'white',
    },
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 20,
        justifyContent: 'center',
    },
    header: {
        marginBottom: 30,
        alignItems: 'center',
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2089dc',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    form: {
        width: '100%',
    },
    input: {
        backgroundColor: '#f5f5f5',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        marginBottom: 15,
        fontSize: 16,
    },
    button: {
        backgroundColor: '#2089dc',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        marginBottom: 15,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    secondaryButton: {
        padding: 10,
        alignItems: 'center',
        marginBottom: 20,
    },
    secondaryButtonText: {
        color: '#2089dc',
        fontSize: 14,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 20,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: '#ddd',
    },
    dividerText: {
        paddingHorizontal: 10,
        color: '#666',
    },
    anonymousButton: {
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        padding: 15,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
    },
    anonymousButtonText: {
        color: '#666',
        fontSize: 16,
    },
});

LoginScreen.displayName = 'LoginScreen';
export default LoginScreen;