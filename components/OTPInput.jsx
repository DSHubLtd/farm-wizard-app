import React, { useRef, useState, useEffect } from 'react';
import {
    View,
    TextInput,
    StyleSheet,
    Clipboard,
    Alert,
    Keyboard,
    Platform,
    Text,
    TouchableOpacity,
} from 'react-native';
import { forgetPassword } from '../services/auth';

const OTP_LENGTH = 6; // 6-digit OTP
const OTP_EXPIRY_TIME = 60; // 60 seconds timer for Resend OTP

const OTPInput = ({ onSubmit, email }) => {
    const [otp, setOtp] = useState(new Array(OTP_LENGTH).fill(''));
    const [timer, setTimer] = useState(OTP_EXPIRY_TIME);
    const [resendEnabled, setResendEnabled] = useState(false);
    const [lastSubmittedOtp, setLastSubmittedOtp] = useState(null);
    const inputs = useRef([]);

    // Timer countdown for Resend OTP
    useEffect(() => {
        if (timer === 0) {
            setResendEnabled(true);
        } else {
            const intervalId = setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);

            return () => clearInterval(intervalId);
        }
    }, [timer]);

    const handleChange = (text, index) => {
        const newOtp = [...otp];

        if (text === '') {
            newOtp[index] = '';
            setOtp(newOtp);
            return;
        }

        if (/^\d$/.test(text)) {
            newOtp[index] = text;
            setOtp(newOtp);
            if (index < OTP_LENGTH - 1) {
                inputs.current[index + 1].focus();
            } else {
                Keyboard.dismiss();
            }
        }
    };

    const handleKeyPress = (e, index) => {
        if (e.nativeEvent.key === 'Backspace') {
            if (otp[index]) {
                // If current field has a value, just clear it
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            } else if (index > 0) {
                // If empty, move focus to previous and clear it
                inputs.current[index - 1].focus();
                const newOtp = [...otp];
                newOtp[index - 1] = '';
                setOtp(newOtp);
            }
        }
    };


    // Check when all inputs are filled
    useEffect(() => {
        if (otp.every(val => val !== '')) {
            const code = otp.join('');
            if (/^\d{6}$/.test(code)) {
                onSubmit(code);
            } else {
                Alert.alert('Invalid OTP', 'Please enter a valid 6-digit OTP.');
            }
        }
    }, [otp]);


    // Optional: Auto-fill from clipboard on focus
    const handlePasteFromClipboard = async () => {
        try {
            const clipboardContent = await Clipboard.getString();
            if (/^\d{6}$/.test(clipboardContent)) {
                if (clipboardContent !== lastSubmittedOtp) {
                    const chars = clipboardContent.split('');
                    setOtp(chars);
                    Keyboard.dismiss();
                    setLastSubmittedOtp(clipboardContent);
                    onSubmit(clipboardContent);
                }
            }
        } catch (error) {
            console.log('Clipboard error:', error);
        }
    };

    // Handle Resend OTP
    const handleResendOTP = async () => {
        setResendEnabled(false);
        setTimer(OTP_EXPIRY_TIME);
        setOtp(new Array(OTP_LENGTH).fill('')); // Reset OTP fields
        inputs.current[0].focus(); // Focus on the first input
        Keyboard.dismiss();
        try {
            const result = await forgetPassword(email);
            if (!result) {
                Alert.alert("Error", "User Not Found");
                return
            }
            if (result.data.success === false) {
                Alert.alert("Error", result.data.message)
                return;
            }
            Alert.alert("Success", "OTP Re-Sent to your email");
        } catch (error) {
            console.log(' error file resending:', error);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.otpContainer}>
                {otp.map((digit, index) => (
                    <TextInput
                        key={index}
                        ref={el => (inputs.current[index] = el)}
                        style={styles.input}
                        keyboardType="number-pad"
                        maxLength={1}
                        value={digit}
                        onChangeText={text => handleChange(text, index)}
                        onKeyPress={e => handleKeyPress(e, index)}
                        onFocus={handlePasteFromClipboard}
                    />
                ))}
            </View>

            {timer > 0 ? (
                <Text style={styles.timerText}>Resend OTP in {timer}s</Text>
            ) : (
                <TouchableOpacity
                    onPress={handleResendOTP}
                    disabled={!resendEnabled}
                    style={[styles.resendButton, resendEnabled ? {} : styles.disabledButton]}
                >
                    <Text style={styles.resendButtonText}>Resend OTP</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20

    },
    otpContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginBottom: 20,
    },
    input: {
        borderBottomWidth: 2,
        borderColor: '#007bff',
        width: 40,
        height: 50,
        margin: 10,
        textAlign: 'center',
        fontSize: 24,
        fontWeight: 'bold',
    },
    timerText: {
        fontSize: 16,
        color: '#555',
        marginBottom: 20,
    },
    resendButton: {
        backgroundColor: '#007bff',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 5,
    },
    resendButtonText: {
        color: '#fff',
        fontSize: 16,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
});

export default OTPInput;
