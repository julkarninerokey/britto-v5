import { useEffect, useState } from 'react';
import { FlatList, View } from 'react-native';
import {
  VStack,
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
import { getAllExaminations } from '../../service/examinationService';
import { formatDate, toast, color } from '../../service/utils';
import { getPaymentHeads } from '../../service/newEnrollmentService';
import { getAsyncStoreData } from '../../utils/async-storage';
import { isDirectPaymentEnabled } from '../../config/paymentConfig';
import { handleDirectPayment } from '../../service/directPaymentService';
import NewExaminationModal from '../../components/NewExaminationModal';

// Helper function to get examination status and icon
const getExaminationStatus = (examination) => {
  const paymentDone = examination.paymentStatus === 'YES' || examination.paymentStatus === 'Paid';
  const deptVerified = examination.departmentVerify === 'YES' || examination.departmentVerify === true;
  
  if (paymentDone && deptVerified) {
    return {
      status: 'Examination Completed',
      icon: '✔︎',               // clean checkmark
      color: '#191970',         // professional midnight blue
      bgColor: '#1e293b'        // subtle light blue background
    };
  } else if (paymentDone && !deptVerified) {
    return {
      status: 'Awaiting Verification',
      icon: '⌛',                // formal hourglass
      color: '#191970',
      bgColor: '#1e293b'        // soft amber background
    };
  } else {
    return {
      status: 'Payment Pending',
      icon: '💰',               // cross mark, more formal than 💰/💳
      color: '#191970',
      bgColor: '#3e4857ff'        // muted red background
    };
  }
};

const ExaminationCard = ({ examination, isExpanded, onToggle, navigation, examinationFee, studentRegNo }) => {
  const statusInfo = getExaminationStatus(examination);
  
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
                    {(examination.examName || 'Unknown Exam')} {(examination.examYear || '')}
                  </Text>
                  
                  {/* Unified Status */}
                  <Text fontSize="xs" fontWeight="500" color={statusInfo.color}>
                    {statusInfo.status}
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
          
          {/* Exam Details */}
          <VStack space={2}>
            <Text fontSize="sm" fontWeight="600" color={color.primary}>
              📅 Form Fill-up Information
            </Text>
            <VStack space={1} pl={4}>
              <DetailRow label="Start Date" value={formatDate(examination.examStartDate)} />
              <DetailRow label="Last Date" value={formatDate(examination.lastDate)} />
              {examination.questionLanguage && (
                <DetailRow label="Language" value={examination.questionLanguage} />
              )}
            
              {examination.examRoll && (
                <DetailRow label="Exam Roll" value={examination.examRoll} bold />
              )}
              {examination.classRoll && (
                <DetailRow label="Class Roll" value={examination.classRoll} />
              )}
              {examination.studentType && (
                <DetailRow label="Student Type" value={examination.studentType} />
              )}
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="xs" color={color.text}>Payment</Text>
              <Text fontSize="xs" fontWeight="500" color={
                examination.paymentStatus === 'YES' || examination.paymentStatus === 'Paid' 
                    ? color.success 
                    : color.warning
                }>
                  {examination.paymentStatus === 'YES' ? 'Paid' : 'Pending'}
                </Text>
              </HStack>
              {examination.departmentVerify !== undefined && (
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Department Verification</Text>
                  <Text fontSize="xs" fontWeight="500" color={
                    examination.departmentVerify === 'YES' || examination.departmentVerify === true 
                      ? color.success 
                      : color.warning
                  }>
                    {examination.departmentVerify === 'YES' || examination.departmentVerify === true ? 'Verified' : 'Pending'}
                  </Text>
                </HStack>
              )}
              
              {examination.departmentVerify !== undefined && (
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Hall Verification</Text>
                  <Text fontSize="xs" fontWeight="500" color={
                    examination.registered_students_college_verify === '1' || examination.registered_students_college_verify === true 
                      ? color.success 
                      : color.warning
                  }>
                    {examination.registered_students_college_verify === '1' || examination.registered_students_college_verify === true ? 'Verified' : 'Pending'}
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>

          {/* Courses */}
          {examination.courses && examination.courses.length > 0 && (
            <VStack space={2}>
              <HStack justifyContent="space-between" alignItems="center">
                <Text fontSize="sm" fontWeight="600" color={color.primary}>
                  📚 Selected Courses
                </Text>
                <HStack space={2} alignItems="center">
                  <Badge
                    bg={color.secondary}
                    borderRadius={10}
                    px={2}
                    py={1}
                    _text={{ color: 'white', fontSize: '2xs' }}
                  >
                    {examination.courses.length}
                  </Badge>
                </HStack>
              </HStack>
              <VStack space={1} pl={4}>
                {examination.courses.map((course, index) => (
                  <CourseRow key={index} course={course} />
                ))}
              </VStack>
            </VStack>
          )}

          {/* Action Buttons */}
          <VStack space={2}>
            {/* Payment Button - Show if payment is pending */}
            {(examination.paymentStatus !== 'YES' && examination.paymentStatus !== 'Paid') && examination.id && (
              <Button
                size="sm"
                bg={color.primary}
                borderRadius={8}
                _pressed={{ bg: color.primaryLight }}
                onPress={async () => {
                  const paymentAmount = calculatePaymentAmount(examination, examinationFee);
                  if (isDirectPaymentEnabled()) {
                    // Direct payment - open gateway immediately
                    await handleDirectPayment({
                      applicationId: examination.id,
                      amount: paymentAmount,
                      type: 'EXAMINATION',
                      studentRegNo: studentRegNo,
                      examName: examination.examName,
                      courses: examination.courses?.length || 0,
                      navigation: navigation, // Pass navigation object
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
                    // Navigate to Payment screen
                    navigation.navigate('Payment', {
                      applicationId: examination.id,
                      type: 'EXAMINATION',
                      amount: paymentAmount,
                      courses: examination.courses?.length || 0,
                      examName: examination.examName,
                      studentRegNo: studentRegNo
                    });
                  }
                }}
              >
                <Text color="white" fontSize="xs" fontWeight="600">
                  💳 Make Payment - ৳{calculatePaymentAmount(examination, examinationFee)}
                </Text>
              </Button>
            )}
            
            {/* Admit Card Button */}
            {examination.admitCardIssue && (
              <Button
                size="sm"
                bg={color.info}
                borderRadius={8}
                _pressed={{ bg: color.light }}
                onPress={() => {
                  toast('info', 'Download Admit Card', 'This feature will be available soon.');
                }}
              >
                <Text color="white" fontSize="xs" fontWeight="600">
                  📥 Download Admit Card
                </Text>
              </Button>
            )}
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

const CourseRow = ({ course }) => (
  <HStack justifyContent="space-between" alignItems="center" py={1}>
    <VStack flex={1}>
      <Text fontSize="xs" fontWeight="500" color={color.text}>
        {course?.courseCode || 'N/A'}
      </Text>
      <Text fontSize="2xs" color={color.muted} numberOfLines={1}>
        {course?.courseTitle || 'No title available'}
      </Text>
    </VStack>
    <Text fontSize="2xs" color={color.secondary} ml={2}>
      {course?.courseCredit || 0} cr
    </Text>
  </HStack>
);

// Helper function to calculate payment amount for existing examinations
const calculatePaymentAmount = (examination, feePerCourse = 100) => {
  const coursesCount = examination.courses?.length || 1;
  return coursesCount * feePerCourse;
};

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

const formItemKey = (item, index) => {
  if (item?.id != null && item.id !== '') {
    return String(item.id);
  }

  return `index-${index}`;
};

const FormFillup = ({navigation}) => {
  const [examinations, setExaminations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewExaminationModal, setShowNewExaminationModal] = useState(false);
  const [examinationFee, setExaminationFee] = useState(100); // Default fee
  const [studentRegNo, setStudentRegNo] = useState('');

  const toggleCard = key => {
    const next = new Set(expandedCards);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setExpandedCards(next);
  };

  useEffect(() => {
    loadExaminations();
    loadPaymentInfo();
    loadStudentRegNo();
  }, []);

  const loadStudentRegNo = async () => {
    try {
      // Try to get from studentDetails first
      const studentDetailsStr = await getAsyncStoreData('studentDetails');
      if (studentDetailsStr) {
        const studentDetails = JSON.parse(studentDetailsStr);
        setStudentRegNo(studentDetails.regNo || '');
        return;
      }
      
      // Fallback to individual key
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
        const examinationHead = response.data.find(head => 
          head.category === 'FORM_FILLUP' || 
          head.name.toLowerCase().includes('form fill-up') ||
          head.name.toLowerCase().includes('form')
        );
        if (examinationHead) {
          setExaminationFee(examinationHead.unit_price);
        }
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
    }
  };

  const loadExaminations = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await getAllExaminations();
      
      if (response.success && response.data) {
        setExaminations(response.data);

        if (response.data.length === 0) {
          setErrorMessage(response.message ||'📝 You haven’t completed any form fill-ups yet. If you’re eligible, you can start a new one');
        }
      } else {
        setErrorMessage(response.message || 'Failed to load examination data.');
        setExaminations([]);
      }
    } catch (error) {
      console.error('Error loading examinations:', error);
      setErrorMessage('An unexpected error occurred.');
      setExaminations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExaminationSuccess = () => {
    // Refresh examinations after successful examination
    loadExaminations();
  };

  return (
    <View style={{flex: 1, backgroundColor: color.secondaryBackground}}>
      <AppBar title="Form Fill-up" />
      {loading ? (
        <LoadingSkeleton />
      ) : (
        <FlatList
          data={examinations}
          keyExtractor={(item, index) => formItemKey(item, index)}
          renderItem={({item, index}) => {
            const itemKey = formItemKey(item, index);
            return (
              <ExaminationCard
                examination={item}
                isExpanded={expandedCards.has(itemKey)}
                onToggle={() => toggleCard(itemKey)}
                navigation={navigation}
                examinationFee={examinationFee}
                studentRegNo={studentRegNo}
              />
            );
          }}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingVertical: 12,
            flexGrow: examinations.length === 0 ? 1 : undefined,
            backgroundColor: color.secondaryBackground,
          }}
          extraData={expandedCards}
          ListEmptyComponent={
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
                onPress={loadExaminations}
              >
                🔄 Refresh
              </Button>
            </Box>
          }
        />
      )}
        
      {/* New Examination Modal */}
      <NewExaminationModal
        isOpen={showNewExaminationModal}
        onClose={() => setShowNewExaminationModal(false)}
        navigation={navigation}
        onExaminationSuccess={handleExaminationSuccess}
      />

      {/* Floating Action Button */}
      <Fab
        renderInPortal={false}
        shadow={2}
        icon={
          <VStack alignItems="center" space={0}>
            <Text color="white" fontSize="xs" fontWeight="500">
             📝 New Form Fill-up
            </Text>
          </VStack>
        }
        bg={color.primary}
        onPress={() => setShowNewExaminationModal(true)}
        position="absolute"
        _pressed={{ 
          bg: color.primaryLight,
          transform: [{ scale: 0.95 }]
        }}
        _hover={{ bg: color.primaryLight }}
      />
    </View>
  );
};

export default FormFillup;
