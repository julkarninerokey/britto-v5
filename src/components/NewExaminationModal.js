import React, { useState, useEffect } from 'react';
import {
  Modal,
  VStack,
  HStack,
  Text,
  Button,
  Box,
  Select,
  CheckIcon,
  Checkbox,
  Divider,
  ScrollView,
  Skeleton,
  Alert,
  Progress,
  Pressable,
  Center,
} from 'native-base';
import { 
  getPaymentHeads, 
  getEnrollmentOptions, 
  calculateTotalCost,
  submitEnrollment 
} from '../service/newEnrollmentService';
import { color, formatDate, toast } from '../service/utils';
import { isDirectPaymentEnabled } from '../config/paymentConfig';
import { handleDirectPayment } from '../service/directPaymentService';
import { getAsyncStoreData } from '../utils/async-storage';

const NewExaminationModal = ({ isOpen, onClose, navigation, onExaminationSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [examinationData, setExaminationData] = useState(null);
  const [paymentHeads, setPaymentHeads] = useState([]);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedCourses, setSelectedCourses] = useState([]);
  const [examinationFee, setExaminationFee] = useState(100);

  useEffect(() => {
    if (isOpen) {
      loadInitialData();
    } else {
      resetModal();
    }
  }, [isOpen]);

  const resetModal = () => {
    setSelectedExam('');
    setSelectedCourses([]);
    setLoading(false);
  };

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [examinationResponse, paymentResponse] = await Promise.all([
        getEnrollmentOptions(), // Using same API for now, can be changed later
        getPaymentHeads()
      ]);
      
      if (examinationResponse.success && examinationResponse.data) {
        setExaminationData(examinationResponse.data);
      }
      
      if (paymentResponse.success && paymentResponse.data) {
        setPaymentHeads(paymentResponse.data);
        const examinationHead = paymentResponse.data.find(head => 
          head.category === 'EXAMINATION' || 
          head.name.toLowerCase().includes('examination') ||
          head.name.toLowerCase().includes('exam')
        );
        setExaminationFee(examinationHead ? examinationHead.unit_price : 100);
      }
      
    } catch (error) {
      console.error('Error loading examination data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExamSelect = (examValue) => {
    setSelectedExam(examValue);
    setSelectedCourses([]); // Reset courses when exam changes
  };

  const handleCourseToggle = (course) => {
    setSelectedCourses(prev => {
      const isSelected = prev.find(c => c.course_code_title_id === course.course_code_title_id);
      if (isSelected) {
        return prev.filter(c => c.course_code_title_id !== course.course_code_title_id);
      } else {
        return [...prev, course];
      }
    });
  };

  const getTotalCost = () => {
    return selectedCourses.length * examinationFee;
  };

  const handleExamine = async () => {
    if (selectedCourses.length === 0) {
      toast('warning', 'Warning', 'Please select at least one course');
      return;
    }

    try {
      setLoading(true);
      
      const selectedExamData = getSelectedExamData();
      if (!selectedExamData) {
        toast('error', 'Error', 'Selected exam data not found');
        return;
      }

      // Validate required fields
      if (!selectedExamData.exam?.registered_exam_id) {
        toast('error', 'Error', 'Exam ID not found. Please select exam again.');
        return;
      }

      if (!selectedExamData.student_type) {
        toast('error', 'Error', 'Student type not found. Please try again.');
        return;
      }

      // Prepare examination data (using same structure as enrollment for now)
      const examinationData = {
        registered_exam_id: selectedExamData.exam.registered_exam_id,
        student_type: selectedExamData.student_type,
        course_code_title_id: selectedCourses.map(course => course.course_code_title_id)
      };

      console.log('Submitting examination:', examinationData);
      
      // Submit examination (using same API as enrollment for now)
      const response = await submitEnrollment(examinationData);
      
      if (response.success && response.data) {
        const applicationId = response.data.registered_student_id;
        
        toast('success', 'Success', response.message || 'Successfully registered for examination!');
        
        // Call success callback if provided
        if (onExaminationSuccess) {
          onExaminationSuccess();
        }
        
        // Close modal first
        onClose();
        
        // Handle payment based on configuration
        setTimeout(async () => {
          if (applicationId) {
            console.log(`Processing payment for examination application ID: ${applicationId}`);
            
            if (isDirectPaymentEnabled()) {
              // Direct payment - open gateway immediately
              try {
                // Get student registration number
                let studentRegNo = '';
                try {
                  const studentDetailsStr = await getAsyncStoreData('studentDetails');
                  if (studentDetailsStr) {
                    const studentDetails = JSON.parse(studentDetailsStr);
                    studentRegNo = studentDetails.regNo || '';
                  }
                  
                  if (!studentRegNo) {
                    const regNo = await getAsyncStoreData('reg');
                    studentRegNo = regNo || '';
                  }
                } catch (error) {
                  console.error('Error loading student reg no:', error);
                }
                
                await handleDirectPayment({
                  applicationId: applicationId,
                  amount: getTotalCost(),
                  type: 'EXAMINATION',
                  studentRegNo: studentRegNo,
                  examName: getSelectedExamData()?.exam.exam_name,
                  courses: selectedCourses.length,
                  navigation: navigation, // Pass navigation object
                  onSuccess: (paymentData) => {
                    console.log('Payment initiated successfully:', paymentData);
                  },
                  onError: (error) => {
                    console.error('Payment error:', error);
                    // Fallback to manual payment instruction
                    toast('warning', 'Payment Required', `Application ID: ${applicationId}\nAmount: ৳${getTotalCost()}\nPlease complete your payment manually.`);
                  },
                  onCancel: () => {
                    console.log('Payment cancelled by user');
                    toast('info', 'Payment Cancelled', 'You can make payment later from the examination section.');
                  }
                });
              } catch (error) {
                console.error('Direct payment error:', error);
                // Fallback to manual payment instruction
                toast('warning', 'Payment Required', `Application ID: ${applicationId}\nAmount: ৳${getTotalCost()}\nPlease complete your payment manually.`);
              }
            } else {
              // Navigate to Payment screen
              if (navigation) {
                navigation.navigate('Payment', { 
                  applicationId: applicationId, 
                  type: 'EXAMINATION',
                  amount: getTotalCost(),
                  courses: selectedCourses.length,
                  examName: getSelectedExamData()?.exam.exam_name
                });
              } else {
                // Fallback: show payment info
                toast('info', 'Payment Required', `Application ID: ${applicationId}\nAmount: ৳${getTotalCost()}\nPlease complete your payment.`);
              }
            }
          } else {
            toast('warning', 'Warning', 'Could not determine application ID for payment');
          }
        }, 1000);
        
      } else {
        toast('error', 'Examination Registration Failed', response.message || 'Your examination registration has failed. Please try again.');
      }
      
    } catch (error) {
      console.error('Examination error:', error);
      toast('error', 'Error', 'An unexpected error occurred during examination registration');
    } finally {
      setLoading(false);
    }
  };

  const getSelectedExamData = () => {
    if (!selectedExam || !examinationData?.exams) return null;
    return examinationData.exams.find((exam, index) => index.toString() === selectedExam);
  };

  if (loading) {
    return (
      <Modal isOpen={isOpen} onClose={onClose} size="full">
        <Modal.Content maxWidth="100%" maxHeight="100%" borderRadius={0} bg={color.background}>
          <Modal.Header bg={color.background} borderBottomWidth={1} borderColor={color.light} py={3}>
            <Text fontSize="lg" fontWeight="600" color={color.text}>New Examination </Text>
          </Modal.Header>
          <Modal.CloseButton />
          <Modal.Body p={4}>
            <VStack space={3} alignItems="center" justifyContent="center" minH="150">
              <Text fontSize="xl">📝</Text>
              <VStack space={2} w="100%">
                <Skeleton h={10} borderRadius={8} />
                <Skeleton h={12} borderRadius={8} />
                <Skeleton h={12} borderRadius={8} />
              </VStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    );
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="full" 
      avoidKeyboard
      maxHeight="80%"
        minHeight="80%"
        top={40}
        bottom={0}
    >
      <Modal.Content
        maxWidth="100%"
        borderRadius={0}
        bg={color.background}
      >
        <Modal.CloseButton 
          _icon={{ color: color.muted, size: 4 }} 
        />
        
        <Modal.Header 
          bg={color.background} 
          borderBottomWidth={1}
          borderColor={color.light}
          py={3}
        >
          <HStack alignItems="center" space={2}>
            <Text fontSize="lg">📝</Text>
            <Text fontSize="lg" fontWeight="600" color={color.text}>
              New Examination
            </Text>
          </HStack>
        </Modal.Header>
        
        <Modal.Body px={3} py={3} bg={color.background}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={3}>
              {/* Exam Selection */}
              <VStack space={2}>
                <Text fontSize="md" fontWeight="600" color={color.text}>
                  Select Examination
                </Text>
                
                <Select
                  selectedValue={selectedExam}
                  placeholder="Choose examination"
                  onValueChange={handleExamSelect}
                  borderRadius={8}
                  borderWidth={1}
                  borderColor={color.light}
                  bg={color.background}
                  fontSize="sm"
                  py={3}
                  _selectedItem={{
                    bg: color.light,
                    endIcon: <CheckIcon size="4" color={color.primary} />
                  }}
                >
                  {examinationData?.exams?.map((examOption, index) => (
                    <Select.Item
                      key={index}
                      label={`${examOption.exam.exam_name} ${examOption.exam.registered_exam_year}`}
                      value={index.toString()}
                    />
                  ))}
                </Select>
              </VStack>

              {/* Course Selection */}
              {selectedExam && getSelectedExamData() && (
                <VStack space={2}>
                  <HStack justifyContent="space-between" alignItems="center">
                    <Text fontSize="md" fontWeight="600" color={color.text}>
                      Select Courses
                    </Text>
                    <Text fontSize="sm" fontWeight="500" color={color.primary}>
                     ৳{examinationFee} x {selectedCourses.length} = {getTotalCost()}/-
                    </Text>
                  </HStack>

                  {/* Course List */}
                  <VStack space={2}>
                    {getSelectedExamData().paper_code_titles.map((course, index) => {
                      const isSelected = selectedCourses.find(c => c.course_code_title_id === course.course_code_title_id);
                      return (
                        <Pressable
                          key={course.course_code_title_id}
                          onPress={() => handleCourseToggle(course)}
                        >
                          {({ isPressed }) => (
                            <Box
                              bg={isSelected ? color.light : color.background}
                              borderWidth={1}
                              borderColor={isSelected ? color.primary : color.light}
                              borderRadius={8}
                              p={3}
                              opacity={isPressed ? 0.8 : 1}
                            >
                              <HStack space={3} alignItems="center">
                                <Box
                                  w={5}
                                  h={5}
                                  borderRadius="full"
                                  borderWidth={1}
                                  borderColor={isSelected ? color.primary : color.muted}
                                  bg={isSelected ? color.primary : 'transparent'}
                                  justifyContent="center"
                                  alignItems="center"
                                >
                                  {isSelected && (
                                    <Text color="white" fontSize="2xs" fontWeight="bold">
                                      ✓
                                    </Text>
                                  )}
                                </Box>
                                
                                <VStack flex={1}>
                                  <Text fontSize="sm" fontWeight="500" color={color.text}>
                                    {course.course_code_title_code}
                                  </Text>
                                  <Text fontSize="xs" color={color.muted} numberOfLines={1}>
                                    {course.course_code_title}
                                  </Text>
                                </VStack>
                                
                                <Text fontSize="xs" color={color.muted}>
                                  {course.course_code_title_credit} credit
                                </Text>
                              </HStack>
                            </Box>
                          )}
                        </Pressable>
                      );
                    })}
                  </VStack>
                </VStack>
              )}

              {/* Payment Summary */}
              {selectedCourses.length > 0 && (
                <VStack space={3}>
                  <Text fontSize="md" fontWeight="600" color={color.text}>
                    Examination Summary
                  </Text>

                  <Box bg={color.light} p={3} borderRadius={8}>
                    <VStack space={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="500" color={color.muted}>
                          Examination
                        </Text>
                        <Text fontSize="xs" color={color.text}>
                            {getSelectedExamData()?.exam.exam_name}
                        </Text>
                      </HStack>

                      <HStack justifyContent="space-between" alignItems="center">
                        <VStack>
                          <Text fontSize="xs" color={color.muted}>Registration Last Date</Text>
                        </VStack>
                        <VStack alignItems="flex-end">
                          <Text fontSize="sm" fontWeight="bold" color={color.text}>
                            {formatDate(getSelectedExamData().exam.enrollment_last_date)}
                          </Text>
                        </VStack>
                      </HStack>

                        <HStack justifyContent="space-between">
                        <Text fontSize="sm" fontWeight="500" color={color.muted}>
                          Selected  {selectedCourses.length > 1 ? 'Courses' : 'Course'}:
                        </Text>
                        <Text fontSize="xs" color={color.text}>
                          {selectedCourses.length}  {selectedCourses.length > 1 ? 'courses' : 'course'}
                        </Text>
                      </HStack>
                   
                      
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="sm" color={color.text}>
                          Total Amount (৳{examinationFee} x {selectedCourses.length} courses)
                        </Text>
                        <Text fontSize="lg" fontWeight="600" color={color.primary}>
                          ৳{getTotalCost()}
                        </Text>
                      </HStack>
                    </VStack>
                  </Box>
                </VStack>
              )}
              
            </VStack>
          </ScrollView>
        </Modal.Body>
        
        <Modal.Footer 
          bg={color.background} 
          borderTopWidth={1} 
          borderColor={color.light}
          p={3}
        >
          <HStack space={2} width="100%">
            <Button
              variant="outline"
              borderColor={color.light}
              onPress={onClose}
              flex={1}
              borderRadius={8}
              py={2}
              _text={{ 
                color: color.text,
                fontSize: "sm"
              }}
            >
              Cancel
            </Button>
            
            <Button
              bg={color.primary}
              onPress={handleExamine}
              isDisabled={selectedCourses.length === 0}
              isLoading={loading}
              flex={2}
              borderRadius={8}
              py={2}
              _text={{ 
                color: 'white',
                fontWeight: "600",
                fontSize: "sm"
              }}
            >
              {selectedCourses.length > 0 
                ? `Pay ৳${getTotalCost()} & Register` 
                : 'Select Courses'
              }
            </Button>
          </HStack>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default NewExaminationModal;
