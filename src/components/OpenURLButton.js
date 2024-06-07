// OpenURLButton.js
import React from 'react';
import { Alert, Linking } from 'react-native';
import { Button } from 'native-base';

const OpenURLButton = ({ url, children }) => {
  const handlePress = async () => {
    // Check if the URL can be opened
    const supported = await Linking.canOpenURL(url);

    if (supported) {
      // Open the URL in the default browser
      await Linking.openURL(url);
    } else {
      Alert.alert(`Don't know how to open this URL: ${url}`);
    }
  };

  return (
    <Button onPress={handlePress} variant="subtle" size="md">
      {children}
    </Button>
  );
};

export default OpenURLButton;
