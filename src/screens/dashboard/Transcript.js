import { useEffect, useState } from 'react';
import { View } from 'react-native';
import {
  VStack,
  ScrollView,
  Text,
  HStack,
  Button,
  Box,
  Badge,
  Divider,
  Skeleton,
  Pressable,
  Collapse,
  Fab,
} from 'native-base';
import AppBar from '../../components/AppBar';
import { getAllTranscripts } from '../../service/transcriptService';
import { formatDate, toast, color } from '../../service/utils';
import { getPaymentHeads } from '../../service/newEnrollmentService';
import { getAsyncStoreData } from '../../utils/async-storage';
import { isDirectPaymentEnabled } from '../../config/paymentConfig';
import { handleDirectPayment } from '../../service/directPaymentService';
import NewApplicationModal from '../../components/NewApplicationModal';

// Helper function to get transcript status and icon
const getTranscriptStatus = (transcript) => {
  const paymentDone = transcript.paymentStatus === 'Paid';
  const hallVerified = transcript.hallVerification === 'Verified';
  const transcriptVerified = transcript.transcriptVerification === 'Verified';
  
  if (paymentDone && hallVerified && transcriptVerified) {
    return {
      status: 'Transcript Ready',
      icon: '✅',
      color: '#191970',
      bgColor: '#1e293b'
    };
  } else if (paymentDone && (hallVerified || transcriptVerified)) {
    return {
      status: 'Under Verification',
      icon: '⏳',
      color: '#191970',
      bgColor: '#1e293b'
    };
  } else if (paymentDone) {
    return {
      status: 'Payment Completed',
      icon: '⏳',
      color: '#191970',
      bgColor: '#1e293b'
    };
  } else {
    return {
      status: 'Payment Pending',
      icon: '⏳',
      color: '#191970',
      bgColor: '#3e4857ff'
    };
  }
};

// Helper components

const TranscriptCard = ({ transcript, isExpanded, onToggle, navigation, transcriptFee, studentRegNo }) => {
  const statusInfo = getTranscriptStatus(transcript);
  
  return (
    <Box
      bg={color.background}
      borderRadius={8}
      borderWidth={1}
      borderColor={color.light}
      mb={2}
      mx={3}
      shadow={1}
    >
      {/* Card Header - Always Visible */}
      <Pressable onPress={onToggle}>
        {({ isPressed }) => (
          <Box
            bg={isPressed ? color.light : 'transparent'}
            p={4}
            borderTopRadius={8}
            borderBottomRadius={isExpanded ? 0 : 8}
          >
            <VStack space={3}>
              {/* Title and Toggle */}
              <HStack justifyContent="space-between" alignItems="center">
                <HStack flex={1} space={3} alignItems="center">
                  {/* Status Icon */}
                  <Box
                    bg={statusInfo.bgColor}
                    p={2}
                    borderRadius="full"
                    w={10}
                    h={10}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Text fontSize="lg">{statusInfo.icon}</Text>
                  </Box>
                  
                  <VStack flex={1} space={1}>
                    <Text
                      fontSize="md"
                      fontWeight="600"
                      color={color.text}
                      numberOfLines={2}
                    >
                      {transcript.transcriptType} - {transcript.degreeLevel}
                    </Text>
                    
                    {/* Unified Status */}
                    <Text fontSize="xs" fontWeight="500" color={statusInfo.color}>
                      {transcript.applicationStatus || statusInfo.status}
                    </Text>
                  </VStack>
                </HStack>
                <Text fontSize="lg" color={color.muted}>
                  {isExpanded ? '⌄' : '›'}
                </Text>
              </HStack>
            </VStack>
          </Box>
        )}
      </Pressable>

      {/* Expandable Details */}
      <Collapse isOpen={isExpanded}>
        <VStack space={3} p={4} pt={0}>
          <Divider />
          
          {/* Detailed Information */}
          <VStack space={4}>
            
            {/* Transcript Details */}
            <VStack space={2}>
              <Text fontSize="sm" fontWeight="600" color={color.primary}>
                📋 Transcript Information
              </Text>
              <VStack space={1} pl={4}>
                <DetailRow label="Transcript Type" value={transcript.transcriptType} bold />
                <DetailRow label="Delivery Type" value={transcript.deliveryType} />
                <DetailRow label="Exam Name" value={transcript.examName} />
                <DetailRow label="Passing Year" value={transcript.passingYear} />
                <DetailRow label="Degree Level" value={transcript.degreeLevel} />
                <DetailRow label="Degree Name" value={transcript.degreeName} />
                <DetailRow label="Roll Number" value={transcript.rollNo} />
                <DetailRow label="Number of Transcripts" value={transcript.numOfTranscript} />
                <DetailRow label="Number of Envelopes" value={transcript.numOfEnvelope} />
                <DetailRow label="Reason" value={transcript.reasonOfApplication} />
                <DetailRow label="Application Date" value={formatDate(transcript.createAt)} />
                <DetailRow label="Amount" value={`৳${transcript.amount}`} bold />
                <DetailRow label="Application ID" value={transcript.applicationId} />
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Application Status</Text>
                  <Text fontSize="xs" fontWeight="500" color={color.info}>
                    {transcript.applicationStatus}
                  </Text>
                </HStack>
              </VStack>
            </VStack>
            <Divider />

            {/* Delivery Methods */}
            {transcript.deliveryMethods && transcript.deliveryMethods.length > 0 && (
              <VStack space={2}>
                <Text fontSize="sm" fontWeight="600" color={color.primary}>
                  🚚 Delivery Methods
                </Text>
                <VStack space={1} pl={4}>
                  {transcript.deliveryMethods.map((method, index) => (
                    <DeliveryMethodRow key={index} method={method} />
                  ))}
                </VStack>
              </VStack>
            )}
            <Divider />

            {/* Status Information */}
            <VStack space={2}>
              <Text fontSize="sm" fontWeight="600" color={color.primary}>
                ⚡ Status Information
              </Text>
              <VStack space={1} pl={4}>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Hall Verification</Text>
                  <Text fontSize="xs" fontWeight="500" color={
                    transcript.hallVerification === 'Verified' ? color.success : color.warning
                  }>
                    {transcript.hallVerification}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Transcript Verification</Text>
                  <Text fontSize="xs" fontWeight="500" color={
                    transcript.transcriptVerification === 'Verified' ? color.success : color.warning
                  }>
                    {transcript.transcriptVerification}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Payment Status</Text>
                  <Text fontSize="xs" fontWeight="500" color={
                    transcript.paymentStatus === 'Paid' ? color.success : color.warning
                  }>
                    {transcript.paymentStatus}
                  </Text>
                </HStack>
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Delivery Status</Text>
                  <Text fontSize="xs" fontWeight="500" color={color.warning}>
                    {transcript.deliveryStatus}
                  </Text>
                </HStack>
                {transcript.transactionId && transcript.transactionId !== 'N/A' && (
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="xs" color={color.text}>Transaction ID</Text>
                    <Text fontSize="xs" fontWeight="500" color={color.secondary}>
                      {transcript.transactionId}
                    </Text>
                  </HStack>
                )}
              </VStack>
            </VStack>
            <Divider />

            {/* Action Buttons */}
            <VStack space={2}>
              {/* Payment Button - Show if payment is pending */}
              {transcript.paymentStatus !== 'Paid' && (
                <Button
                  size="sm"
                  bg={transcript.hallVerification !== 'Verified' ? color.gray : color.green}
                  borderRadius={8}
                  _pressed={{ bg: color.primaryLight }}
                  onPress={async () => {
                    const paymentAmount = parseFloat(transcript.amount) || transcriptFee;
                    if (transcript.hallVerification !== 'Verified') {
                      toast('warning', 'Hall Verification Pending', 'Please complete hall verification first.');
                      return;
                    }
                    if (isDirectPaymentEnabled()) {
                      await handleDirectPayment({
                        applicationId: transcript.id,
                        amount: paymentAmount,
                        type: 'TRANSCRIPT',
                        studentRegNo: studentRegNo,
                        transcriptType: transcript.transcriptType,
                        deliveryType: transcript.deliveryType,
                        navigation: navigation,
                        onSuccess: (paymentData) => {
                          console.log('Payment initiated successfully:', paymentData);
                        },
                        onError: (error) => {
                          console.error('Payment error:', error);
                        },
                        onCancel: () => {
                          console.log('Payment cancelled by user');
                        }
                      });
                    } else {
                      navigation.navigate('Payment', {
                        applicationId: transcript.id,
                        type: 'TRANSCRIPT',
                        amount: paymentAmount,
                        transcriptType: transcript.transcriptType,
                        deliveryType: transcript.deliveryType,
                        studentRegNo: studentRegNo
                      });
                    }
                  }}
                >
                  <Text color="white" fontSize="xs" fontWeight="600">
                    💳 Make Payment - ৳{transcript.amount}
                  </Text>
                </Button>
              )}
              
              {/* Download Button */}
              <Button
                size="sm"
                bg={color.primaryDark}
                borderRadius={8}
                _pressed={{ bg: color.primaryLight }}
                onPress={() => {
                  toast('info', 'Download Transcript', 'This feature will be available soon.');
                }}
              >
                <Text color="white" fontSize="xs" fontWeight="600">
                  📥 Download Application
                </Text>
              </Button>
            </VStack>
          </VStack>
        </VStack>
      </Collapse>
    </Box>
  );
};

// Helper components
const DetailRow = ({ label, value, bold }) => (
  <HStack justifyContent="space-between" alignItems="center">
    <Text fontSize="xs" color={color.text}>
      {label || 'N/A'}
    </Text>
    <Text 
      fontSize="xs" 
      fontWeight={bold ? "600" : "400"} 
      color={bold ? color.primary : color.text}
    >
      {value || 'N/A'}
    </Text>
  </HStack>
);

const DeliveryMethodRow = ({ method }) => (
  <VStack space={1} bg={color.secondaryBackground} p={2} borderRadius={4}>
    <Text fontSize="xs" fontWeight="500" color={color.primary}>
      {method.method === 'OverTheCounter' ? 'Over the Counter Pickup' : 
       method.method === 'Email' ? 'Email Delivery' : 'Postal Mail Delivery'}
    </Text>
    {method.details && (
      <VStack space={0.5}>
        {method.details.isSelf && (
          <Text fontSize="2xs" color={color.text}>
            Authorised Person: Self
          </Text>
        )}
        {!method.details.isSelf && method.details.receiverName && (
          <>
          <Text fontSize="2xs" color={color.text}>
            Authorised Person: {method.details.receiverName} 
          </Text>
          <Text fontSize="2xs" color={color.text}> 
          Phone: {method.details.receiverMobile}
          </Text>
          </>
        )}
        {method.details.emailAddress && (
          <Text fontSize="2xs" color={color.text}>
            Email: {method.details.emailAddress}
          </Text>
        )}
        {method.details.address && (
          <Text fontSize="2xs" color={color.text}>
            Address: {method.details.address}
          </Text>
        )}
        <Text fontSize="2xs" color={method.details.isDelivered ? color.success : color.warning}>
          Status: {method.details.isDelivered ? 'Delivered' : 'Pending'}
        </Text>
      </VStack>
    )}
  </VStack>
);

const LoadingSkeleton = () => (
  <VStack space={2} p={3}>
    {[...Array(3)].map((_, index) => (
      <Box key={index} bg={color.background} p={4} borderRadius={8} borderWidth={1} borderColor={color.light}>
        <VStack space={3}>
          <HStack justifyContent="space-between" alignItems="center">
            <VStack flex={1} space={1}>
              <Skeleton.Text lines={1} w="80%" />
              <Skeleton.Text lines={1} w="30%" />
            </VStack>
            <Skeleton w={4} h={4} borderRadius={2} />
          </HStack>
          <HStack space={2}>
            <Skeleton w={12} h={4} borderRadius={8} />
            <Skeleton w={16} h={4} borderRadius={8} />
          </HStack>
          <HStack justifyContent="space-between">
            <VStack space={1}>
              <Skeleton.Text lines={1} w={12} />
              <Skeleton.Text lines={1} w={16} />
            </VStack>
            <VStack space={1} alignItems="flex-end">
              <Skeleton.Text lines={1} w={8} />
              <Skeleton.Text lines={1} w={12} />
            </VStack>
          </HStack>
        </VStack>
      </Box>
    ))}
  </VStack>
);

const Transcript = ({navigation}) => {
  const [transcripts, setTranscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewTranscriptModal, setShowNewTranscriptModal] = useState(false);
  const [transcriptFee, setTranscriptFee] = useState(100);
  const [studentRegNo, setStudentRegNo] = useState('');

  const toggleCard = (index) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  useEffect(() => {
    loadTranscripts();
    loadPaymentInfo();
    loadStudentRegNo();
  }, []);

  const loadStudentRegNo = async () => {
    try {
      const studentDetailsStr = await getAsyncStoreData('studentDetails');
      if (studentDetailsStr) {
        const studentDetails = JSON.parse(studentDetailsStr);
        setStudentRegNo(studentDetails.regNo || '');
        return;
      }
      
      const regNo = await getAsyncStoreData('reg');
      if (regNo) {
        setStudentRegNo(regNo);
        return;
      }
      
      console.warn('Student registration number not found in storage');
    } catch (error) {
      console.error('Error loading student registration number:', error);
    }
  };

  const loadPaymentInfo = async () => {
    try {
      const response = await getPaymentHeads();
      if (response.success && response.data) {
        const transcriptHead = response.data.find(head => 
          head.category === 'TRANSCRIPT' || 
          head.name.toLowerCase().includes('transcript')
        );
        if (transcriptHead) {
          setTranscriptFee(transcriptHead.unit_price);
        }
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
    }
  };

  const loadTranscripts = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await getAllTranscripts();
      
      if (response.success && response.data) {
        setTranscripts(response.data);
        if (response.data.length === 0) {
          setErrorMessage(response?.message || '📋 You haven\'t applied for any transcripts yet. Apply now if you\'re ready.');
        }
      } else {
        setErrorMessage(response.message || 'Failed to load transcript data.');
        setTranscripts([]);
      }
    } catch (error) {
      console.error('Error loading transcripts:', error);
      setErrorMessage('An unexpected error occurred.');
      setTranscripts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscriptSuccess = () => {
    loadTranscripts();
  };

  return (
    <View style={{flex: 1, backgroundColor: color.secondaryBackground}}>
      <AppBar title="Transcript" />
      <VStack w={'100%'} flex={1} bg={color.secondaryBackground}>
        {loading ? (
          <LoadingSkeleton />
        ) : transcripts && transcripts.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={1} py={3}>
              {transcripts.map((transcript, index) => (
                <TranscriptCard
                  key={transcript.id || index}
                  transcript={transcript}
                  isExpanded={expandedCards.has(index)}
                  onToggle={() => toggleCard(index)}
                  navigation={navigation}
                  transcriptFee={transcriptFee}
                  studentRegNo={studentRegNo}
                />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center" p={6}>
            <Text 
              color={color.secondary} 
              fontSize="sm" 
              textAlign="center" 
              lineHeight={20}
            >
              {errorMessage}
            </Text>
            <Button
              mt={4}
              size="sm"
              variant="outline"
              borderColor={color.primary}
              _text={{ color: color.primary }}
              onPress={() => {
                loadTranscripts();
              }}
            >
              🔄 Refresh
            </Button>
          </Box>
        )}
        
        {/* New Transcript Modal */}
        <NewApplicationModal
          isOpen={showNewTranscriptModal}
          onClose={() => setShowNewTranscriptModal(false)}
          navigation={navigation}
          onApplicationSuccess={handleTranscriptSuccess}
          applicationType="TRANSCRIPT"
        />

        {/* Floating Action Button */}
        <Fab
          renderInPortal={false}
          shadow={2}
          icon={
            <VStack alignItems="center" space={0}>
              <Text color="white" fontSize="xs" fontWeight="500">
               📋 Apply for Transcript
              </Text>
            </VStack>
          }
          bg={color.primary}
          onPress={() => setShowNewTranscriptModal(true)}
          position="absolute"
          _pressed={{ 
            bg: color.primaryLight,
            transform: [{ scale: 0.95 }]
          }}
          _hover={{ bg: color.primaryLight }}
        />
      </VStack>
    </View>
  );
};

export default Transcript;
