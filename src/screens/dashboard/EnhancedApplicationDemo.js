import React, { useState } from 'react';
import { View } from 'react-native';
import {
  VStack,
  Text,
  Button,
  Box,
  HStack,
  Badge,
  ScrollView,
} from 'native-base';
import AppBar from '../../components/AppBar';
import NewApplicationModal from '../../components/NewApplicationModal';
import { color } from '../../service/utils';

const EnhancedApplicationDemo = ({ navigation }) => {
  const [showCertificateModal, setShowCertificateModal] = useState(false);
  const [showTranscriptModal, setShowTranscriptModal] = useState(false);

  const handleApplicationSuccess = (type) => {
    console.log(`${type} application submitted successfully!`);
    // Refresh application data here if needed
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.background }}>
      <AppBar navigation={navigation} title="Enhanced Application System" />
      
      <ScrollView flex={1} p={4}>
        <VStack space={4}>
          {/* Feature Overview */}
          <Box bg="white" p={4} borderRadius={12} shadow={1}>
            <Text fontSize="lg" fontWeight="600" mb={3}>
              🎉 Enhanced Application Features
            </Text>
            <VStack space={2}>
              <HStack space={2} alignItems="center">
                <Badge colorScheme="green">NEW</Badge>
                <Text fontSize="sm">My Degree not in listed option</Text>
              </HStack>
              <HStack space={2} alignItems="center">
                <Badge colorScheme="blue">ENHANCED</Badge>
                <Text fontSize="sm">Smart fee calculation with breakdown</Text>
              </HStack>
              <HStack space={2} alignItems="center">
                <Badge colorScheme="purple">IMPROVED</Badge>
                <Text fontSize="sm">Advanced delivery options</Text>
              </HStack>
              <HStack space={2} alignItems="center">
                <Badge colorScheme="orange">DYNAMIC</Badge>
                <Text fontSize="sm">Real-time API integration</Text>
              </HStack>
            </VStack>
          </Box>

          {/* Application Types */}
          <VStack space={3}>
            {/* Certificate Application */}
            <Box bg="white" p={4} borderRadius={12} shadow={1}>
              <HStack justifyContent="space-between" alignItems="center" mb={3}>
                <VStack>
                  <Text fontSize="md" fontWeight="600">📋 Certificate Application</Text>
                  <Text fontSize="xs" color={color.secondary}>
                    Enhanced with custom degree entry
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  bg={color.primary}
                  onPress={() => setShowCertificateModal(true)}
                >
                  Apply Now
                </Button>
              </HStack>
              
              <VStack space={1}>
                <Text fontSize="xs">✅ Auto-populate from completed degrees</Text>
                <Text fontSize="xs">✅ Manual entry for unlisted degrees</Text>
                <Text fontSize="xs">✅ Multiple delivery methods</Text>
                <Text fontSize="xs">✅ Dynamic fee calculation</Text>
              </VStack>
            </Box>

            {/* Transcript Application */}
            <Box bg="white" p={4} borderRadius={12} shadow={1}>
              <HStack justifyContent="space-between" alignItems="center" mb={3}>
                <VStack>
                  <Text fontSize="md" fontWeight="600">📜 Transcript Application</Text>
                  <Text fontSize="xs" color={color.secondary}>
                    Same enhanced features for transcripts
                  </Text>
                </VStack>
                <Button
                  size="sm"
                  bg={color.primary}
                  onPress={() => setShowTranscriptModal(true)}
                >
                  Apply Now
                </Button>
              </HStack>
              
              <VStack space={1}>
                <Text fontSize="xs">✅ Department and hall selection</Text>
                <Text fontSize="xs">✅ International postal delivery</Text>
                <Text fontSize="xs">✅ Authorised person collection</Text>
                <Text fontSize="xs">✅ Photo upload support</Text>
              </VStack>
            </Box>
          </VStack>

          {/* Features List */}
          <Box bg="white" p={4} borderRadius={12} shadow={1}>
            <Text fontSize="md" fontWeight="600" mb={3}>
              🔥 New Features Highlights
            </Text>
            
            <VStack space={3}>
              <Box>
                <Text fontSize="sm" fontWeight="600" color={color.primary}>
                  🎯 Custom Degree Entry
                </Text>
                <Text fontSize="xs">
                  When your degree is not listed, manually enter program, department, 
                  exam year, roll number, and hall information.
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color={color.primary}>
                  💰 Smart Fee Calculation
                </Text>
                <Text fontSize="xs">
                  Automatic calculation including certificate fee, delivery charges, 
                  hall development fee, and urgent processing fees.
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color={color.primary}>
                  🚚 Advanced Delivery Options
                </Text>
                <Text fontSize="xs">
                  Choose multiple delivery methods: Over counter (free), Email, 
                  Postal mail (local/international) with proper fee calculation.
                </Text>
              </Box>

              <Box>
                <Text fontSize="sm" fontWeight="600" color={color.primary}>
                  👤 Flexible Collection
                </Text>
                <Text fontSize="xs">
                  Self collection or authorised person with photo upload support 
                  for verification.
                </Text>
              </Box>
            </VStack>
          </Box>
        </VStack>
      </ScrollView>

      {/* Enhanced Certificate Modal */}
      <NewApplicationModal
        isOpen={showCertificateModal}
        onClose={() => setShowCertificateModal(false)}
        navigation={navigation}
        onApplicationSuccess={() => handleApplicationSuccess('Certificate')}
        applicationType="CERTIFICATE"
      />

      {/* Enhanced Transcript Modal */}
      <NewApplicationModal
        isOpen={showTranscriptModal}
        onClose={() => setShowTranscriptModal(false)}
        navigation={navigation}
        onApplicationSuccess={() => handleApplicationSuccess('Transcript')}
        applicationType="TRANSCRIPT"
      />
    </View>
  );
};

export default EnhancedApplicationDemo;
