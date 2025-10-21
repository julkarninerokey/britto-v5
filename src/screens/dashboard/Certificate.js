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
import { getAllCertificates } from '../../service/certificateService';
import { formatDate, toast, color } from '../../service/utils';
import { getPaymentHeads } from '../../service/newEnrollmentService';
import { getAsyncStoreData } from '../../utils/async-storage';
import { isDirectPaymentEnabled } from '../../config/paymentConfig';
import { handleDirectPayment } from '../../service/directPaymentService';
import NewApplicationModal from '../../components/NewApplicationModal';

// Helper function to get certificate status and icon
const getCertificateStatus = (certificate) => {
  const paymentDone = certificate.paymentStatus === 'Paid';
  const hallVerified = certificate.hallVerification === 'Verified';
  const certificateVerified = certificate.certificateVerification === 'Verified';
  
  if (paymentDone && hallVerified && certificateVerified) {
    return {
      status: 'Certificate Ready',
      icon: '✅',
      color: '#191970',
      bgColor: '#1e293b'
    };
  } else if (paymentDone && (hallVerified || certificateVerified)) {
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

const CertificateCard = ({ certificate, isExpanded, onToggle, navigation, certificateFee, studentRegNo }) => {
  const statusInfo = getCertificateStatus(certificate);
  
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
      {({ isPressed }) => (         <Box
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
                    {certificate.certificateType} Certificate - {certificate.degreeLevel}
                  </Text>
                  
                  {/* Unified Status */}
                  <Text fontSize="xs" fontWeight="500" color={statusInfo.color}>
                    {certificate.applicationStatus || statusInfo.status}
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
          
          {/* Certificate Details */}
          <VStack space={2}>
            <Text fontSize="sm" fontWeight="600" color={color.primary}>
              📋 Certificate Information
            </Text>
            <VStack space={1} pl={4}>
              <DetailRow label="Certificate Type" value={certificate.certificateType} bold />
              <DetailRow label="Delivery Type" value={certificate.deliveryType} />
              <DetailRow label="Passing Year" value={certificate.passingYear} />
              <DetailRow label="Roll Number" value={certificate.rollNo} />
              <DetailRow label="Reason" value={certificate.reasonOfApplication} />
              <DetailRow label="Application Date" value={formatDate(certificate.createAt)} />
              <DetailRow label="Amount" value={`৳${certificate.amount}`} bold />
              <DetailRow label="Application ID" value={certificate.applicationId}  />
               <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" color={color.text}>Application Status</Text>
                <Text fontSize="xs" fontWeight="500" color={color.info}>
                  {certificate.applicationStatus}
                </Text>
              </HStack>
            </VStack>
          </VStack>
                  <Divider />

{/* Delivery Methods */}
          {certificate.deliveryMethods && certificate.deliveryMethods.length > 0 && (
            <VStack space={2}>
              <Text fontSize="sm" fontWeight="600" color={color.primary}>
                🚚 Delivery Methods
              </Text>
              <VStack space={1} pl={4}>
                {certificate.deliveryMethods.map((method, index) => (
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
                  certificate.hallVerification === 'Verified' ? color.success : color.warning
                }>
                  {certificate.hallVerification}
                </Text>
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" color={color.text}>Payment Status</Text>
                <Text fontSize="xs" fontWeight="500" color={
                  certificate.paymentStatus === 'Paid' ? color.success : color.warning
                }>
                  {certificate.paymentStatus}
                </Text>
              </HStack>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="xs" color={color.text}>Delivery Status</Text>
                <Text fontSize="xs" fontWeight="500" color={color.warning}>
                  {certificate.deliveryStatus}
                </Text>
              </HStack>
              {certificate.transactionId && certificate.transactionId !== 'N/A' && (
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Transaction ID</Text>
                  <Text fontSize="xs" fontWeight="500" color={color.secondary}>
                    {certificate.transactionId}
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>
        <Divider />

          {/* Action Buttons */}
          <VStack space={2}>
            {/* Payment Button - Show if payment is pending */}
            {certificate.paymentStatus !== 'Paid' && (
              <Button
                size="sm"
                bg={certificate.hallVerification !== 'Verified' ? color.gray : color.green}
                // disabled={certificate.hallVerification !== 'Verified'}
                borderRadius={8}
                _pressed={{ bg: color.primaryLight }}
                onPress={async () => {
                  const paymentAmount = parseFloat(certificate.amount) || certificateFee;
                  if (certificate.hallVerification !== 'Verified') {
                    // Show a message or handle the case when hall verification is not done
                    toast('warning', 'Hall Verification Pending', 'Please complete hall verification first.');
                    return;
                  }
                  if (isDirectPaymentEnabled()) {
                    await handleDirectPayment({
                      applicationId: certificate.id,
                      amount: paymentAmount,
                      type: 'CERTIFICATE',
                      studentRegNo: studentRegNo,
                      certificateType: certificate.certificateType,
                      deliveryType: certificate.deliveryType,
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
                      applicationId: certificate.id,
                      type: 'CERTIFICATE',
                      amount: paymentAmount,
                      certificateType: certificate.certificateType,
                      deliveryType: certificate.deliveryType,
                      studentRegNo: studentRegNo
                    });
                  }
                }}
              >
                <Text color="white" fontSize="xs" fontWeight="600">
                  💳 Make Payment - ৳{certificate.amount}
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
                  toast('info', 'Download Certificate', 'This feature will be available soon.');
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

const Certificate = ({navigation}) => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewCertificateModal, setShowNewCertificateModal] = useState(false);
  const [certificateFee, setCertificateFee] = useState(100);
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
    loadCertificates();
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
        const certificateHead = response.data.find(head => 
          head.category === 'CERTIFICATE' || 
          head.name.toLowerCase().includes('certificate')
        );
        if (certificateHead) {
          setCertificateFee(certificateHead.unit_price);
        }
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
    }
  };

  const loadCertificates = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await getAllCertificates();
      
      if (response.success && response.data) {
        setCertificates(response.data);
        if (response.data.length === 0) {
          setErrorMessage(response?.message || '🎓 You haven’t applied for any certificates yet. Apply now if you’re ready.');
        }
      } else {
        setErrorMessage(response.message || 'Failed to load certificate data.');
        setCertificates([]);
      }
    } catch (error) {
      console.error('Error loading certificates:', error);
      setErrorMessage('An unexpected error occurred.');
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCertificateSuccess = () => {
    loadCertificates();
  };

  return (
    <View style={{flex: 1, backgroundColor: color.secondaryBackground}}>
      <AppBar title="Certificate" />
      <VStack w={'100%'} flex={1} bg={color.secondaryBackground}>
        {loading ? (
          <LoadingSkeleton />
        ) : certificates && certificates.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={1} py={3}>
              {certificates.map((certificate, index) => (
                <CertificateCard
                  key={certificate.id || index}
                  certificate={certificate}
                  isExpanded={expandedCards.has(index)}
                  onToggle={() => toggleCard(index)}
                  navigation={navigation}
                  certificateFee={certificateFee}
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
                loadCertificates();
              }}
            >
              🔄 Refresh
            </Button>
          </Box>
        )}
        
        {/* New Certificate Modal */}
        <NewApplicationModal
          isOpen={showNewCertificateModal}
          onClose={() => setShowNewCertificateModal(false)}
          navigation={navigation}
          onApplicationSuccess={handleCertificateSuccess}
          applicationType="CERTIFICATE"
        />

        {/* Floating Action Button */}
        <Fab
          renderInPortal={false}
          shadow={2}
          icon={
            <VStack alignItems="center" space={0}>
              <Text color="white" fontSize="xs" fontWeight="500">
               📋 Apply for Certificate
              </Text>
            </VStack>
          }
          bg={color.primary}
          onPress={() => setShowNewCertificateModal(true)}
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

export default Certificate;
