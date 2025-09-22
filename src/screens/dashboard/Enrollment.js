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
import { getAllEnrollments } from '../../service/enrollmentService';
import { formatDate, toast, color } from '../../service/utils';
import { getPaymentHeads } from '../../service/newEnrollmentService';
import { getAsyncStoreData } from '../../utils/async-storage';
import { isDirectPaymentEnabled } from '../../config/paymentConfig';
import { handleDirectPayment } from '../../service/directPaymentService';
import NewEnrollmentModal from '../../components/NewEnrollmentModal';

// Helper function to get enrollment status and icon
const getEnrollmentStatus = (enrollment) => {
  const paymentDone = enrollment.paymentStatus === 'YES' || enrollment.paymentStatus === 'Paid';
  const deptVerified = enrollment.departmentVerify === 'YES' || enrollment.departmentVerify === true;
  
  if (paymentDone && deptVerified) {
  return {
    status: 'Enrollment Completed',
    icon: '✔︎',               // clean checkmark
    color: '#191970',         // professional midnight blue
    bgColor: '#1e293b'        // subtle light blue background
  };
} else if (paymentDone && !deptVerified) {
  return {
    status: 'Awaiting Department Verification',
    icon: '⌛',                // formal hourglass
    color: '#191970',
    bgColor: '#1e293b'        // soft amber background
  };
} else {
  return {
    status: 'Payment Pending',
    icon: '⌛',               // cross mark, more formal than 💰/💳
    color: '#191970',
    bgColor: '#3e4857ff'        // muted red background
  };
}
};

const EnrollmentCard = ({ enrollment, isExpanded, onToggle, navigation, enrollmentFee, studentRegNo }) => {
  const statusInfo = getEnrollmentStatus(enrollment);
  
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
                    {(enrollment.examName || 'Unknown Exam')} {(enrollment.examYear || '')}
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
              📅 Enrollment Information
            </Text>
            <VStack space={1} pl={4}>
              <DetailRow label="Start Date" value={formatDate(enrollment.examStartDate)} />
              <DetailRow label="Last Date" value={formatDate(enrollment.lastDate)} />
              {enrollment.questionLanguage && (
                <DetailRow label="Language" value={enrollment.questionLanguage} />
              )}
            
              {enrollment.examRoll && (
                <DetailRow label="Exam Roll" value={enrollment.examRoll} bold />
              )}
              {enrollment.classRoll && (
                <DetailRow label="Class Roll" value={enrollment.classRoll} />
              )}
              {enrollment.studentType && (
                <DetailRow label="Student Type" value={enrollment.studentType} />
              )}
            
            <HStack justifyContent="space-between" alignItems="center">
              <Text fontSize="xs" color={color.text}>Payment</Text>
              <Text fontSize="xs" fontWeight="500" color={
                enrollment.paymentStatus === 'YES' || enrollment.paymentStatus === 'Paid' 
                    ? color.success 
                    : color.warning
                }>
                  {enrollment.paymentStatus || 'Pending'}
                </Text>
              </HStack>
              {enrollment.departmentVerify !== undefined && (
                <HStack justifyContent="space-between" alignItems="center">
                  <Text fontSize="xs" color={color.text}>Department Verification</Text>
                  <Text fontSize="xs" fontWeight="500" color={
                    enrollment.departmentVerify === 'YES' || enrollment.departmentVerify === true 
                      ? color.success 
                      : color.warning
                  }>
                    {enrollment.departmentVerify === 'YES' || enrollment.departmentVerify === true ? 'Verified' : 'Pending'}
                  </Text>
                </HStack>
              )}
            </VStack>
          </VStack>

          {/* Courses */}
          {enrollment.courses && enrollment.courses.length > 0 && (
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
                    {enrollment.courses.length}
                  </Badge>
                </HStack>
              </HStack>
              <VStack space={1} pl={4}>
                {enrollment.courses.map((course, index) => (
                  <CourseRow key={index} course={course} />
                ))}
              </VStack>
            </VStack>
          )}

          {/* Action Buttons */}
          <VStack space={2}>
            {/* Payment Button - Show if payment is pending */}
            {(enrollment.paymentStatus !== 'YES' && enrollment.paymentStatus !== 'Paid') && enrollment.id && (
              <Button
                size="sm"
                bg={color.primary}
                borderRadius={8}
                _pressed={{ bg: color.primaryLight }}
                onPress={async () => {
                  const paymentAmount = calculatePaymentAmount(enrollment, enrollmentFee);
                  if (isDirectPaymentEnabled()) {
                    // Direct payment - open gateway immediately
                    await handleDirectPayment({
                      applicationId: enrollment.id,
                      amount: paymentAmount,
                      type: 'ENROLMENT',
                      studentRegNo: studentRegNo,
                      examName: enrollment.examName,
                      courses: enrollment.courses?.length || 0,
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
                      applicationId: enrollment.id,
                      type: 'ENROLMENT',
                      amount: paymentAmount,
                      courses: enrollment.courses?.length || 0,
                      examName: enrollment.examName,
                      studentRegNo: studentRegNo
                    });
                  }
                }}
              >
                <Text color="white" fontSize="xs" fontWeight="600">
                  💳 Make Payment - ৳{calculatePaymentAmount(enrollment, enrollmentFee)}
                </Text>
              </Button>
            )}
            
            {/* Admit Card Button */}
            {enrollment.admitCardIssue && (
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

// Helper function to calculate payment amount for existing enrollments
const calculatePaymentAmount = (enrollment, feePerCourse = 100) => {
  const coursesCount = enrollment.courses?.length || 1;
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

const Enrollment = ({navigation}) => {
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [errorMessage, setErrorMessage] = useState('');
  const [showNewEnrollmentModal, setShowNewEnrollmentModal] = useState(false);
  const [enrollmentFee, setEnrollmentFee] = useState(100); // Default fee
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
    loadEnrollments();
    loadPaymentInfo();
    loadStudentRegNo();
  }, []);

  const loadStudentRegNo = async () => {
    try {
      // Try to get from studentDetails first
      const studentDetailsStr = await getAsyncStoreData('studentDetails');
      if (studentDetailsStr) {
        const studentDetails = JSON.parse(studentDetailsStr);
        console.log('🚀 ~ loadStudentRegNo ~ studentDetails:', studentDetails);
        setStudentRegNo(studentDetails.regNo || '');
        return;
      }
      
      // Fallback to individual key
      const regNo = await getAsyncStoreData('reg');
      if (regNo) {
        console.log('🚀 ~ loadStudentRegNo ~ regNo from reg key:', regNo);
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
        const enrollmentHead = response.data.find(head => 
          head.category === 'ENROLMENT' || 
          head.name.toLowerCase().includes('enrollment') ||
          head.name.toLowerCase().includes('enrolment')
        );
        if (enrollmentHead) {
          setEnrollmentFee(enrollmentHead.unit_price);
        }
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
    }
  };

  const loadEnrollments = async () => {
    setLoading(true);
    setErrorMessage('');
    
    try {
      const response = await getAllEnrollments();
      
      if (response.success && response.data) {
        setEnrollments(response.data);
        if (response.data.length === 0) {
          setErrorMessage('📝 No enrollment data available at the moment.');
        }
      } else {
        setErrorMessage(response.message || 'Failed to load enrollment data.');
        setEnrollments([]);
      }
    } catch (error) {
      console.error('Error loading enrollments:', error);
      setErrorMessage('An unexpected error occurred.');
      setEnrollments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEnrollmentSuccess = () => {
    // Refresh enrollments after successful enrollment
    loadEnrollments();
  };

  return (
    <View style={{flex: 1, backgroundColor: color.secondaryBackground}}>
      <AppBar title="Enrollment" />
      <VStack w={'100%'} flex={1} bg={color.secondaryBackground}>
        {loading ? (
          <LoadingSkeleton />
        ) : enrollments && enrollments.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={1} py={3}>
              {enrollments.map((enrollment, index) => (
                <EnrollmentCard
                  key={enrollment.id || index}
                  enrollment={enrollment}
                  isExpanded={expandedCards.has(index)}
                  onToggle={() => toggleCard(index)}
                  navigation={navigation}
                  enrollmentFee={enrollmentFee}
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
                loadEnrollments();
              }}
            >
              🔄 Try Again
            </Button>
          </Box>
        )}
        
        {/* New Enrollment Modal */}
        <NewEnrollmentModal
          isOpen={showNewEnrollmentModal}
          onClose={() => setShowNewEnrollmentModal(false)}
          navigation={navigation}
          onEnrollmentSuccess={handleEnrollmentSuccess}
        />

        {/* Floating Action Button */}
        <Fab
          renderInPortal={false}
          shadow={2}
                    icon={
            <VStack alignItems="center" space={0}>
              <Text color="white" fontSize="xs" fontWeight="500">
               📚 New Enrollment
              </Text>
            </VStack>
          }
          bg={color.primary}
          onPress={() => setShowNewEnrollmentModal(true)}
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

export default Enrollment;
