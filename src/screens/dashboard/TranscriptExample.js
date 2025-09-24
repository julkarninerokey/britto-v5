import React, { useState } from 'react';
import { View } from 'react-native';
import {
  VStack,
  Text,
  Button,
  Box,
  HStack,
} from 'native-base';
import AppBar from '../../components/AppBar';
import NewApplicationModal from '../../components/NewApplicationModal';
import { color } from '../../service/utils';

const TranscriptScreen = ({ navigation }) => {
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  const handleTranscriptSuccess = () => {
    console.log('Transcript application submitted successfully!');
    // Refresh transcript data here if needed
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <AppBar navigation={navigation} title="Transcript Applications" />
      
      <VStack flex={1} p={4} space={4}>
        <Box bg="white" p={4} borderRadius={12} shadow={1}>
          <Text fontSize="lg" fontWeight="600" mb={3}>
            📜 Transcript Services
          </Text>
          <Text fontSize="sm" color={color.secondary} mb={4}>
            Apply for official transcript copies with secure delivery options.
          </Text>
          
          <Button
            bg={color.primary}
            onPress={() => setShowTranscriptModal(true)}
            _pressed={{ bg: color.primaryLight }}
          >
            📝 New Transcript Application
          </Button>
        </Box>

        <Box bg="white" p={4} borderRadius={12} shadow={1}>
          <Text fontSize="md" fontWeight="600" mb={3}>
            💡 Application Information
          </Text>
          <VStack space={2}>
            <HStack justifyContent="space-between">
              <Text fontSize="sm">Processing Time:</Text>
              <Text fontSize="sm" fontWeight="500">5-7 business days</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="sm">Urgent Processing:</Text>
              <Text fontSize="sm" fontWeight="500">2-3 business days</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="sm">Base Fee:</Text>
              <Text fontSize="sm" fontWeight="500">৳500</Text>
            </HStack>
            <HStack justifyContent="space-between">
              <Text fontSize="sm">Urgent Fee:</Text>
              <Text fontSize="sm" fontWeight="500">৳1000</Text>
            </HStack>
          </VStack>
        </Box>
      </VStack>

      {/* Dynamic Application Modal - configured for TRANSCRIPT */}
      <NewApplicationModal
        isOpen={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
        navigation={navigation}
        onApplicationSuccess={handleTranscriptSuccess}
        applicationType="TRANSCRIPT"
      />
    </View>
  );
};

export default TranscriptScreen;
