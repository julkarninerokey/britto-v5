import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import {
  VStack,
  HStack,
  Text,
  Switch,
  Box,
  ScrollView,
  Divider,
  Button,
} from 'native-base';
import AppBar from '../../components/AppBar';
import { color, toast } from '../../service/utils';
import { PAYMENT_CONFIG } from '../../config/paymentConfig';

const PaymentSettings = ({ navigation }) => {
  const [directPayment, setDirectPayment] = useState(PAYMENT_CONFIG.DIRECT_PAYMENT);
  const [autoOpenPayment, setAutoOpenPayment] = useState(PAYMENT_CONFIG.AUTO_OPEN_PAYMENT);
  const [showConfirmation, setShowConfirmation] = useState(PAYMENT_CONFIG.SHOW_PAYMENT_CONFIRMATION);

  const handleSaveSettings = () => {
    // Update the configuration object
    PAYMENT_CONFIG.DIRECT_PAYMENT = directPayment;
    PAYMENT_CONFIG.AUTO_OPEN_PAYMENT = autoOpenPayment;
    PAYMENT_CONFIG.SHOW_PAYMENT_CONFIRMATION = showConfirmation;
    
    toast('success', 'Settings Saved', 'Payment settings have been updated successfully!');
  };

  const resetToDefaults = () => {
    setDirectPayment(true);
    setAutoOpenPayment(true);
    setShowConfirmation(true);
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
      <AppBar title="Payment Settings" />
      
      <ScrollView flex={1} p={4}>
        <VStack space={4}>
          
          {/* Header */}
          <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
            <VStack space={2}>
              <Text fontSize="lg" fontWeight="600" color={color.text}>
                💳 Payment Configuration
              </Text>
              <Text fontSize="sm" color={color.muted}>
                Configure how payments work in your app. Changes take effect immediately.
              </Text>
            </VStack>
          </Box>

          {/* Direct Payment Setting */}
          <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1} mr={3}>
                  <Text fontSize="md" fontWeight="600" color={color.text}>
                    Direct Payment
                  </Text>
                  <Text fontSize="sm" color={color.muted}>
                    {directPayment 
                      ? 'Skip payment screen and open gateway directly' 
                      : 'Show payment details screen before gateway'
                    }
                  </Text>
                </VStack>
                <Switch
                  size="md"
                  isChecked={directPayment}
                  onToggle={setDirectPayment}
                  onTrackColor={color.primary}
                  offTrackColor={color.light}
                />
              </HStack>
            </VStack>
          </Box>

          {/* Auto Open Payment Setting */}
          <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1} mr={3}>
                  <Text fontSize="md" fontWeight="600" color={color.text}>
                    Auto Open Payment
                  </Text>
                  <Text fontSize="sm" color={color.muted}>
                    {autoOpenPayment 
                      ? 'Automatically open payment after enrollment' 
                      : 'Manual payment initiation required'
                    }
                  </Text>
                </VStack>
                <Switch
                  size="md"
                  isChecked={autoOpenPayment}
                  onToggle={setAutoOpenPayment}
                  onTrackColor={color.primary}
                  offTrackColor={color.light}
                />
              </HStack>
            </VStack>
          </Box>

          {/* Payment Confirmation Setting */}
          <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
            <VStack space={3}>
              <HStack justifyContent="space-between" alignItems="center">
                <VStack flex={1} mr={3}>
                  <Text fontSize="md" fontWeight="600" color={color.text}>
                    Payment Confirmation
                  </Text>
                  <Text fontSize="sm" color={color.muted}>
                    {showConfirmation 
                      ? 'Show confirmation dialog before payment' 
                      : 'No confirmation dialog shown'
                    }
                  </Text>
                </VStack>
                <Switch
                  size="md"
                  isChecked={showConfirmation}
                  onToggle={setShowConfirmation}
                  onTrackColor={color.primary}
                  offTrackColor={color.light}
                />
              </HStack>
            </VStack>
          </Box>

          {/* Current Configuration Summary */}
          <Box bg={color.lightBlue} p={4} borderRadius={12}>
            <VStack space={2}>
              <Text fontSize="md" fontWeight="600" color={color.text}>
                📋 Current Configuration
              </Text>
              <Text fontSize="sm" color={color.text}>
                • Payment Flow: {directPayment ? 'Direct (Skip payment screen)' : 'Standard (Show payment screen)'}
              </Text>
              <Text fontSize="sm" color={color.text}>
                • Auto Payment: {autoOpenPayment ? 'Enabled' : 'Disabled'}
              </Text>
              <Text fontSize="sm" color={color.text}>
                • Confirmation: {showConfirmation ? 'Show confirmation dialog' : 'No confirmation'}
              </Text>
            </VStack>
          </Box>

          {/* Action Buttons */}
          <VStack space={3}>
            <Button
              bg={color.primary}
              onPress={handleSaveSettings}
              borderRadius={12}
              py={3}
              _text={{
                color: 'white',
                fontWeight: '600',
                fontSize: 'md',
              }}
            >
              💾 Save Settings
            </Button>
            
            <Button
              variant="outline"
              borderColor={color.muted}
              onPress={resetToDefaults}
              borderRadius={12}
              py={3}
              _text={{
                color: color.text,
                fontWeight: '600',
              }}
            >
              🔄 Reset to Defaults
            </Button>
          </VStack>

          {/* Help Information */}
          <Box bg={color.background} p={4} borderRadius={12} shadow={1}>
            <VStack space={2}>
              <Text fontSize="md" fontWeight="600" color={color.primary}>
                ℹ️ How it works
              </Text>
              <Text fontSize="sm" color={color.text}>
                <Text fontWeight="600">Direct Payment ON:</Text> When users click "Make Payment", the payment gateway opens immediately in the device browser.
              </Text>
              <Text fontSize="sm" color={color.text}>
                <Text fontWeight="600">Direct Payment OFF:</Text> Users first see a payment details screen, then click "Proceed to Payment" to open the gateway.
              </Text>
            </VStack>
          </Box>
          
        </VStack>
      </ScrollView>
    </View>
  );
};

export default PaymentSettings;
