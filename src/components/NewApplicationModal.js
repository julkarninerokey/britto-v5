import React, { useState, useEffect } from 'react';
import {
  Modal,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  Select,
  Input,
  CheckIcon,
  Radio,
  useToast,
  Divider,
  ScrollView,
  Box,
  Checkbox,
} from 'native-base';
import { getPaymentHeads } from '../service/newEnrollmentService';
import { getAsyncStoreData } from '../utils/async-storage';
import { isDirectPaymentEnabled } from '../config/paymentConfig';
import { handleDirectPayment } from '../service/directPaymentService';
import { color } from '../service/utils';
import { 
  getCompletedDegrees, 
  getAllDepartments, 
  getPrograms, 
  getAllHalls,
  submitCertificateApplication 
} from '../service/applicationService';

const NewApplicationModal = ({ isOpen, onClose, navigation, onApplicationSuccess, applicationType = 'CERTIFICATE' }) => {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [applicationFee, setApplicationFee] = useState(100);
  const [emailFee, setEmailFee] = useState(0);
  const [postalLocalFee, setPostalLocalFee] = useState(0);
  const [postalAbroadFee, setPostalAbroadFee] = useState(0);
  const [hallDevelopmentFee, setHallDevelopmentFee] = useState(0);
  const [paymentHeads, setPaymentHeads] = useState([]);
  const [studentRegNo, setStudentRegNo] = useState('');
  const [completedDegrees, setCompletedDegrees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [halls, setHalls] = useState([]);
  const toast = useToast();
  
  const [formData, setFormData] = useState({
    // Basic info
    program: '',
    examSelect: '',
    subjectName: '',
    subjectId: '',
    examYearSelect: '',
    examRollInput: '',
    department: '',
    hall: '',
    
    // Manual degree entry flag
    isCustomDegree: false,
    
    // Certificate/Application type
    certificateType: 'Provisional',
    deliveryTypeMethod: 'Regular',
    reasonOfApplication: 'New Application',
    applicationType: applicationType,
    
    // Delivery methods (checkboxes)
    overCounter: false,
    emailDelivery: false,
    postalMail: false,
    
    // Over counter details
    isSelf: true,
    isAuthorisedPerson: false,
    overCounterName: '',
    overCounterMobile: '',
    photoUpload: null,
    
    // Email delivery
    emailAddress: '',
    
    // Postal delivery
    postalCountry: 'Bangladesh',
    postalAddress: '',
    postalType: 'Local', // Local or Abroad
  });

  const certificateTypes = [
    { label: 'Provisional Certificate', value: 'Provisional' },
    { label: 'Final Certificate', value: 'Final' },
    { label: 'Diploma Certificate', value: 'Diploma' },
  ];

  const deliveryTypes = [
    { label: 'Regular', value: 'Regular' },
    { label: 'Urgent', value: 'Urgent' },
  ];

  const reasonOptions = [
    { label: 'New Application', value: 'New Application' },
    { label: 'Damaged', value: 'Damaged' },
    { label: 'Information Updated', value: 'Information Updated' },
    { label: 'Lost or Stolen', value: 'Lost or Stolen' },
  ];

  const countries = [
    { label: 'Bangladesh', value: 'Bangladesh' },
    { label: 'India', value: 'India' },
    { label: 'Pakistan', value: 'Pakistan' },
    { label: 'United States', value: 'United States' },
    { label: 'United Kingdom', value: 'United Kingdom' },
    { label: 'Canada', value: 'Canada' },
    { label: 'Australia', value: 'Australia' },
    { label: 'Germany', value: 'Germany' },
    { label: 'France', value: 'France' },
    { label: 'Other', value: 'Other' },
  ];

  useEffect(() => {
    if (isOpen) {
      loadAllData();
    }
  }, [isOpen]);

  const loadAllData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadPaymentInfo(),
        loadStudentRegNo(),
        loadCompletedDegrees(),
        loadDepartments(),
        loadPrograms(),
        loadHalls(),
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

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
    } catch (error) {
      console.error('Error loading student registration number:', error);
    }
  };

  const loadPaymentInfo = async () => {
    try {
      const response = await getPaymentHeads();
      if (response.success && response.data) {
        setPaymentHeads(response.data);
        
        // Find certificate application fee
        const applicationHead = response.data.find(head => 
          head.category === applicationType || 
          head.name.toLowerCase().includes(applicationType.toLowerCase()) ||
          head.name.toLowerCase().includes('certificate')
        );
        if (applicationHead) {
          setApplicationFee(applicationHead.unit_price);
        }

        // Find email delivery fee
        const emailHead = response.data.find(head => 
          head.name.toLowerCase().includes('email') ||
          head.name.toLowerCase().includes('soft copy')
        );
        if (emailHead) {
          setEmailFee(emailHead.unit_price);
        }

        // Find postal delivery fees
        const postalLocalHead = response.data.find(head => 
          head.name.toLowerCase().includes('postal') && 
          head.name.toLowerCase().includes('local')
        );
        if (postalLocalHead) {
          setPostalLocalFee(postalLocalHead.unit_price);
        }

        const postalAbroadHead = response.data.find(head => 
          head.name.toLowerCase().includes('postal') && 
          head.name.toLowerCase().includes('abroad')
        );
        if (postalAbroadHead) {
          setPostalAbroadFee(postalAbroadHead.unit_price);
        }

        // Find hall development fee
        const hallHead = response.data.find(head => 
          head.name.toLowerCase().includes('hall') && 
          head.name.toLowerCase().includes('development')
        );
        if (hallHead) {
          setHallDevelopmentFee(hallHead.unit_price);
        }
      }
    } catch (error) {
      console.error('Error loading payment info:', error);
    }
  };

  const loadCompletedDegrees = async () => {
    try {
      const response = await getCompletedDegrees();
      if (response.success && response.data) {
        setCompletedDegrees(response.data);
      }
    } catch (error) {
      console.error('Error loading completed degrees:', error);
    }
  };

  const loadDepartments = async () => {
    try {
      const response = await getAllDepartments();
      if (response.success && response.data) {
        setDepartments(response.data);
      }
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const loadPrograms = async () => {
    try {
      const response = await getPrograms();
      if (response.success && response.data) {
        setPrograms(response.data);
      }
    } catch (error) {
      console.error('Error loading programs:', error);
    }
  };

  const loadHalls = async () => {
    try {
      const response = await getAllHalls();
      if (response.success && response.data) {
        setHalls(response.data);
      }
    } catch (error) {
      console.error('Error loading halls:', error);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const newData = { ...prev, [field]: value };
      
      // Auto-populate fields when exam is selected
      if (field === 'examSelect') {
        if (value === 'CUSTOM_DEGREE') {
          // User selected "My Degree not in listed"
          newData.isCustomDegree = true;
          newData.subjectName = '';
          newData.subjectId = '';
          newData.examYearSelect = '';
          newData.examRollInput = '';
          newData.program = '';
          newData.department = '';
          newData.hall = '';
        } else {
          // User selected an existing degree
          newData.isCustomDegree = false;
          const selectedDegree = completedDegrees.find(degree => degree.id === value);
          if (selectedDegree) {
            newData.subjectName = selectedDegree.subjectsTitle || selectedDegree.degree?.degree_name || '';
            newData.subjectId = selectedDegree.subjectsId || selectedDegree.degree?.subjects_id || '';
            newData.examYearSelect = selectedDegree.examYear || selectedDegree.exam?.registered_exam_year || '';
            newData.examRollInput = selectedDegree.examRoll || '';
            newData.program = selectedDegree.programsId?.toString() || selectedDegree.degree?.program_id?.toString() || '';
            newData.department = selectedDegree.departmentId?.toString() || '';
            newData.hall = selectedDegree.hallId?.toString() || '';
          }
        }
      }

      // Handle postal type based on country
      if (field === 'postalCountry') {
        newData.postalType = value === 'Bangladesh' ? 'Local' : 'Abroad';
      }
      
      return newData;
    });
  };

  const validateForm = () => {
    if (!formData.program) {
      toast.show({
        description: 'Please select program',
        status: 'warning'
      });
      return false;
    }
    
    if (!formData.examSelect) {
      toast.show({
        description: 'Please select exam or degree',
        status: 'warning'
      });
      return false;
    }

    // Validate custom degree fields if selected
    if (formData.isCustomDegree) {
      if (!formData.department) {
        toast.show({
          description: 'Please select department',
          status: 'warning'
        });
        return false;
      }

      if (!formData.examYearSelect) {
        toast.show({
          description: 'Please enter exam year',
          status: 'warning'
        });
        return false;
      }

      if (!formData.examRollInput) {
        toast.show({
          description: 'Please enter exam roll number',
          status: 'warning'
        });
        return false;
      }

      if (!formData.hall) {
        toast.show({
          description: 'Please select hall',
          status: 'warning'
        });
        return false;
      }
    }
    
    if (!formData.certificateType) {
      toast.show({
        description: 'Please select certificate type',
        status: 'warning'
      });
      return false;
    }
    
    if (!formData.deliveryTypeMethod) {
      toast.show({
        description: 'Please select delivery type',
        status: 'warning'
      });
      return false;
    }
    
    if (!formData.reasonOfApplication) {
      toast.show({
        description: 'Please select reason for application',
        status: 'warning'
      });
      return false;
    }

    // At least one delivery method must be selected
    if (!formData.overCounter && !formData.emailDelivery && !formData.postalMail) {
      toast.show({
        description: 'Please select at least one delivery method',
        status: 'warning'
      });
      return false;
    }

    // Validate delivery method specific fields
    if (formData.overCounter) {
      if (!formData.overCounterName || !formData.overCounterMobile) {
        toast.show({
          description: 'Please fill receiver name and mobile for counter delivery',
          status: 'warning'
        });
        return false;
      }
    }

    if (formData.emailDelivery) {
      if (!formData.emailAddress) {
        toast.show({
          description: 'Please enter email address for email delivery',
          status: 'warning'
        });
        return false;
      }
    }

    if (formData.postalMail) {
      if (!formData.postalAddress) {
        toast.show({
          description: 'Please enter postal address for mail delivery',
          status: 'warning'
        });
        return false;
      }
    }

    return true;
  };

  const prepareFormData = () => {
    const submitData = new URLSearchParams();
    
    // Basic information
    submitData.append('program', formData.program);
    submitData.append('examSelect', formData.examSelect);
    submitData.append('subject_name', formData.subjectName);
    submitData.append('subject_id', formData.subjectId);
    submitData.append('examYearSelect', formData.examYearSelect);
    submitData.append('examRollInput', formData.examRollInput);
    
    // Certificate details
    submitData.append('certificate_type', formData.certificateType);
    submitData.append('deliveryTypeMethod', formData.deliveryTypeMethod);
    submitData.append('reason_of_application', formData.reasonOfApplication);
    submitData.append('application_type', formData.applicationType);
    
    // Delivery methods
    if (formData.overCounter) {
      submitData.append('overCounter', 'on');
      if (formData.isSelf) {
        submitData.append('isSelf', 'on');
      }
      submitData.append('overCounterName', formData.overCounterName);
      submitData.append('overCounterMobile', formData.overCounterMobile);
    }
    
    if (formData.emailDelivery) {
      submitData.append('emailDelivery', 'on');
      submitData.append('emailAddress', formData.emailAddress);
    }
    
    if (formData.postalMail) {
      submitData.append('postalMail', 'on');
      submitData.append('postalCountry', formData.postalCountry);
      submitData.append('postalAddress', formData.postalAddress);
    }
    
    return submitData;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setSubmitLoading(true);
    try {
      const submitData = prepareFormData();
      const response = await submitCertificateApplication(submitData);
      
      if (response.success) {
        toast.show({
          description: response.message || 'Application submitted successfully!',
          status: 'success'
        });
        
        handleClose();
        if (onApplicationSuccess) {
          onApplicationSuccess();
        }
      } else {
        toast.show({
          description: response.message || 'Failed to submit application',
          status: 'error'
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.show({
        description: 'Failed to submit application. Please try again.',
        status: 'error'
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      program: '',
      examSelect: '',
      subjectName: '',
      subjectId: '',
      examYearSelect: '',
      examRollInput: '',
      department: '',
      hall: '',
      isCustomDegree: false,
      certificateType: 'Provisional',
      deliveryTypeMethod: 'Regular',
      reasonOfApplication: 'New Application',
      applicationType: applicationType,
      overCounter: false,
      emailDelivery: false,
      postalMail: false,
      isSelf: true,
      isAuthorisedPerson: false,
      overCounterName: '',
      overCounterMobile: '',
      photoUpload: null,
      emailAddress: '',
      postalCountry: 'Bangladesh',
      postalAddress: '',
      postalType: 'Local',
    });
    onClose();
  };

  const calculateAmount = () => {
    let totalAmount = applicationFee;
    
    // Add urgent delivery charges
    if (formData.deliveryTypeMethod === 'Urgent') {
      totalAmount = totalAmount * 2;
    }

    // Add delivery method fees
    if (formData.emailDelivery) {
      totalAmount += emailFee;
    }

    if (formData.postalMail) {
      if (formData.postalType === 'Abroad') {
        totalAmount += postalAbroadFee;
      } else {
        totalAmount += postalLocalFee;
      }
    }

    // Add hall development fee
    if (formData.hall) {
      totalAmount += hallDevelopmentFee;
    }

    // Over the counter has no additional fee (fee = 0)
    
    return totalAmount;
  };

  const getModalTitle = () => {
    switch (applicationType) {
      case 'CERTIFICATE':
        return '📋 New Certificate Application';
      case 'TRANSCRIPT':
        return '📜 New Transcript Application';
      default:
        return '📝 New Application';
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="full">
      <Modal.Content maxWidth="95%" maxHeight="90%">
        <Modal.CloseButton />
        <Modal.Header bg={color.primary}>
          <Text color="white" fontSize="lg" fontWeight="600">
            {getModalTitle()}
          </Text>
        </Modal.Header>
        
        <Modal.Body bg={color.background}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack space={4} py={2}>
              {loading ? (
                <Box p={4}>
                  <Text textAlign="center">Loading application data...</Text>
                </Box>
              ) : (
                <>
                  {/* Program Selection */}
                  <FormControl isRequired>
                    <FormControl.Label>Program</FormControl.Label>
                    <Select
                      selectedValue={formData.program}
                      onValueChange={(value) => handleInputChange('program', value)}
                      placeholder="Select program"
                      _selectedItem={{
                        bg: color.primary,
                        endIcon: <CheckIcon size="5" color="white" />,
                      }}
                    >
                      {programs.map((program) => (
                        <Select.Item 
                          key={program.programsId} 
                          label={program.programsName} 
                          value={program.programsId.toString()} 
                        />
                      ))}
                    </Select>
                  </FormControl>

                  {/* Exam/Degree Selection */}
                  <FormControl isRequired>
                    <FormControl.Label>Completed Degree</FormControl.Label>
                    <Select
                      selectedValue={formData.examSelect}
                      onValueChange={(value) => handleInputChange('examSelect', value)}
                      placeholder="Select completed degree"
                      _selectedItem={{
                        bg: color.primary,
                        endIcon: <CheckIcon size="5" color="white" />,
                      }}
                    >
                      {completedDegrees.map((degree) => (
                        <Select.Item 
                          key={degree.id} 
                          label={`${degree.degreeName} (${degree.examYear})`} 
                          value={degree.id} 
                        />
                      ))}
                      <Select.Item 
                        label="🔸 My Degree not in listed" 
                        value="CUSTOM_DEGREE" 
                      />
                    </Select>
                  </FormControl>

                  {/* Custom Degree Fields */}
                  {formData.isCustomDegree && (
                    <VStack space={3} bg={color.light} p={4} borderRadius={8}>
                      <Text fontSize="sm" fontWeight="600" color={color.primary}>
                        📝 Enter Degree Information
                      </Text>

                      {/* Department Selection */}
                      <FormControl isRequired>
                        <FormControl.Label>Department</FormControl.Label>
                        <Select
                          selectedValue={formData.department}
                          onValueChange={(value) => handleInputChange('department', value)}
                          placeholder="Select department"
                          _selectedItem={{
                            bg: color.primary,
                            endIcon: <CheckIcon size="5" color="white" />,
                          }}
                        >
                          {departments.map((dept) => (
                            <Select.Item 
                              key={dept.id} 
                              label={dept.name} 
                              value={dept.id.toString()} 
                            />
                          ))}
                        </Select>
                      </FormControl>

                      {/* Exam Year Input */}
                      <FormControl isRequired>
                        <FormControl.Label>Exam Year</FormControl.Label>
                        <Input
                          value={formData.examYearSelect}
                          onChangeText={(value) => handleInputChange('examYearSelect', value)}
                          placeholder="Enter exam year (e.g., 2020)"
                          keyboardType="numeric"
                        />
                      </FormControl>

                      {/* Roll Number Input */}
                      <FormControl isRequired>
                        <FormControl.Label>Roll Number</FormControl.Label>
                        <Input
                          value={formData.examRollInput}
                          onChangeText={(value) => handleInputChange('examRollInput', value)}
                          placeholder="Enter roll number"
                          keyboardType="numeric"
                        />
                      </FormControl>

                      {/* Hall Selection */}
                      <FormControl isRequired>
                        <FormControl.Label>Hall</FormControl.Label>
                        <Select
                          selectedValue={formData.hall}
                          onValueChange={(value) => handleInputChange('hall', value)}
                          placeholder="Select hall"
                          _selectedItem={{
                            bg: color.primary,
                            endIcon: <CheckIcon size="5" color="white" />,
                          }}
                        >
                          {halls.map((hall) => (
                            <Select.Item 
                              key={hall.id} 
                              label={hall.name} 
                              value={hall.id.toString()} 
                            />
                          ))}
                        </Select>
                      </FormControl>
                    </VStack>
                  )}

                  {/* Auto-populated fields for selected degree */}
                  {formData.examSelect && !formData.isCustomDegree && (
                    <VStack space={3} bg={color.light} p={3} borderRadius={8}>
                      <Text fontSize="sm" fontWeight="600" color={color.primary}>
                        📋 Degree Information
                      </Text>
                      <VStack space={1}>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs">Subject:</Text>
                          <Text fontSize="xs" fontWeight="500">{formData.subjectName}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs">Exam Year:</Text>
                          <Text fontSize="xs" fontWeight="500">{formData.examYearSelect}</Text>
                        </HStack>
                        <HStack justifyContent="space-between">
                          <Text fontSize="xs">Exam Roll:</Text>
                          <Text fontSize="xs" fontWeight="500">{formData.examRollInput}</Text>
                        </HStack>
                      </VStack>
                    </VStack>
                  )}

                  {/* Certificate Type */}
                  <FormControl isRequired>
                    <FormControl.Label>Certificate Type</FormControl.Label>
                    <Select
                      selectedValue={formData.certificateType}
                      onValueChange={(value) => handleInputChange('certificateType', value)}
                      placeholder="Select certificate type"
                      _selectedItem={{
                        bg: color.primary,
                        endIcon: <CheckIcon size="5" color="white" />,
                      }}
                    >
                      {certificateTypes.map((type) => (
                        <Select.Item key={type.value} label={type.label} value={type.value} />
                      ))}
                    </Select>
                  </FormControl>

                  {/* Delivery Type */}
                  <FormControl isRequired>
                    <FormControl.Label>Delivery Type</FormControl.Label>
                    <Select
                      selectedValue={formData.deliveryTypeMethod}
                      onValueChange={(value) => handleInputChange('deliveryTypeMethod', value)}
                      placeholder="Select delivery type"
                      _selectedItem={{
                        bg: color.primary,
                        endIcon: <CheckIcon size="5" color="white" />,
                      }}
                    >
                      {deliveryTypes.map((type) => (
                        <Select.Item key={type.value} label={type.label} value={type.value} />
                      ))}
                    </Select>
                  </FormControl>

                  {/* Reason for Application */}
                  <FormControl isRequired>
                    <FormControl.Label>Reason for Application</FormControl.Label>
                    <Select
                      selectedValue={formData.reasonOfApplication}
                      onValueChange={(value) => handleInputChange('reasonOfApplication', value)}
                      placeholder="Select reason"
                      _selectedItem={{
                        bg: color.primary,
                        endIcon: <CheckIcon size="5" color="white" />,
                      }}
                    >
                      {reasonOptions.map((reason) => (
                        <Select.Item key={reason.value} label={reason.label} value={reason.value} />
                      ))}
                    </Select>
                  </FormControl>

                  <Divider />

                  {/* Delivery Methods */}
                  <FormControl>
                    <FormControl.Label>Delivery Methods (Select at least one)</FormControl.Label>
                    
                    {/* Over the Counter */}
                    <VStack space={3} mt={2}>
                      <Checkbox
                        isChecked={formData.overCounter}
                        onChange={(value) => handleInputChange('overCounter', value)}
                        value="overCounter"
                      >
                        Over the Counter
                      </Checkbox>
                      
                      {formData.overCounter && (
                        <VStack space={3} pl={6} bg={color.secondaryBackground} p={3} borderRadius={8}>
                          <Text fontSize="sm" fontWeight="600">Collection Type</Text>
                          
                          <Radio.Group
                            name="collectionType"
                            value={formData.isSelf ? 'self' : 'authorised'}
                            onChange={(value) => {
                              handleInputChange('isSelf', value === 'self');
                              handleInputChange('isAuthorisedPerson', value === 'authorised');
                            }}
                          >
                            <VStack space={2}>
                              <Radio value="self">Self Collection</Radio>
                              <Radio value="authorised">Authorised Person</Radio>
                            </VStack>
                          </Radio.Group>
                          
                          <FormControl isRequired>
                            <FormControl.Label>
                              {formData.isSelf ? 'Your Name' : 'Authorised Person Name'}
                            </FormControl.Label>
                            <Input
                              value={formData.overCounterName}
                              onChangeText={(value) => handleInputChange('overCounterName', value)}
                              placeholder={formData.isSelf ? "Enter your name" : "Enter authorised person's name"}
                            />
                          </FormControl>
                          
                          <FormControl isRequired>
                            <FormControl.Label>
                              {formData.isSelf ? 'Your Mobile' : 'Authorised Person Mobile'}
                            </FormControl.Label>
                            <Input
                              value={formData.overCounterMobile}
                              onChangeText={(value) => handleInputChange('overCounterMobile', value)}
                              placeholder={formData.isSelf ? "Enter your mobile number" : "Enter authorised person's mobile"}
                              keyboardType="phone-pad"
                            />
                          </FormControl>

                          {!formData.isSelf && (
                            <FormControl>
                              <FormControl.Label>Photo Upload (Optional)</FormControl.Label>
                              <Button
                                variant="outline"
                                onPress={() => {
                                  // TODO: Implement photo upload functionality
                                  toast.show({
                                    description: 'Photo upload feature will be implemented',
                                    status: 'info'
                                  });
                                }}
                                leftIcon={<Text>📷</Text>}
                              >
                                {formData.photoUpload ? 'Change Photo' : 'Upload Photo'}
                              </Button>
                            </FormControl>
                          )}
                        </VStack>
                      )}
                    </VStack>

                    {/* Email Delivery */}
                    <VStack space={3} mt={4}>
                      <Checkbox
                        isChecked={formData.emailDelivery}
                        onChange={(value) => handleInputChange('emailDelivery', value)}
                        value="emailDelivery"
                      >
                        Email Delivery
                      </Checkbox>
                      
                      {formData.emailDelivery && (
                        <VStack pl={6} bg={color.secondaryBackground} p={3} borderRadius={8}>
                          <FormControl isRequired>
                            <FormControl.Label>Email Address</FormControl.Label>
                            <Input
                              value={formData.emailAddress}
                              onChangeText={(value) => handleInputChange('emailAddress', value)}
                              placeholder="Enter email address"
                              keyboardType="email-address"
                            />
                          </FormControl>
                        </VStack>
                      )}
                    </VStack>

                    {/* Postal Mail */}
                    <VStack space={3} mt={4}>
                      <Checkbox
                        isChecked={formData.postalMail}
                        onChange={(value) => handleInputChange('postalMail', value)}
                        value="postalMail"
                      >
                        Postal Mail
                      </Checkbox>
                      
                      {formData.postalMail && (
                        <VStack space={3} pl={6} bg={color.secondaryBackground} p={3} borderRadius={8}>
                          <FormControl isRequired>
                            <FormControl.Label>Country</FormControl.Label>
                            <Select
                              selectedValue={formData.postalCountry}
                              onValueChange={(value) => handleInputChange('postalCountry', value)}
                              placeholder="Select country"
                              _selectedItem={{
                                bg: color.primary,
                                endIcon: <CheckIcon size="5" color="white" />,
                              }}
                            >
                              {countries.map((country) => (
                                <Select.Item 
                                  key={country.value} 
                                  label={country.label} 
                                  value={country.value} 
                                />
                              ))}
                            </Select>
                          </FormControl>

                          {formData.postalCountry !== 'Bangladesh' && (
                            <Box bg="amber.100" p={2} borderRadius={6}>
                              <Text fontSize="xs" color="amber.800">
                                📮 International delivery selected - additional charges apply
                              </Text>
                            </Box>
                          )}
                          
                          <FormControl isRequired>
                            <FormControl.Label>Complete Postal Address</FormControl.Label>
                            <Input
                              value={formData.postalAddress}
                              onChangeText={(value) => handleInputChange('postalAddress', value)}
                              placeholder="Enter complete postal address with postal code"
                              multiline
                              numberOfLines={4}
                            />
                          </FormControl>
                        </VStack>
                      )}
                    </VStack>
                  </FormControl>

                  {/* Amount Preview with Breakdown */}
                  <Box bg={color.light} p={4} borderRadius={8}>
                    <Text fontSize="md" fontWeight="600" mb={3}>💰 Fee Breakdown</Text>
                    
                    <VStack space={2}>
                      {/* Base Application Fee */}
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm">Certificate Application Fee:</Text>
                        <Text fontSize="sm" fontWeight="500">৳{applicationFee}</Text>
                      </HStack>

                      {/* Urgent Delivery Fee */}
                      {formData.deliveryTypeMethod === 'Urgent' && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="orange.600">Urgent Processing Fee:</Text>
                          <Text fontSize="sm" fontWeight="500" color="orange.600">৳{applicationFee}</Text>
                        </HStack>
                      )}

                      {/* Email Delivery Fee */}
                      {formData.emailDelivery && emailFee > 0 && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">Email Delivery Fee:</Text>
                          <Text fontSize="sm" fontWeight="500">৳{emailFee}</Text>
                        </HStack>
                      )}

                      {/* Postal Delivery Fee */}
                      {formData.postalMail && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">
                            Postal Delivery ({formData.postalType}) Fee:
                          </Text>
                          <Text fontSize="sm" fontWeight="500">
                            ৳{formData.postalType === 'Abroad' ? postalAbroadFee : postalLocalFee}
                          </Text>
                        </HStack>
                      )}

                      {/* Hall Development Fee */}
                      {formData.hall && hallDevelopmentFee > 0 && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">Hall Development Fee:</Text>
                          <Text fontSize="sm" fontWeight="500">৳{hallDevelopmentFee}</Text>
                        </HStack>
                      )}

                      {/* Over Counter (Free) */}
                      {formData.overCounter && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="green.600">Over Counter Delivery:</Text>
                          <Text fontSize="sm" fontWeight="500" color="green.600">FREE</Text>
                        </HStack>
                      )}

                      <Divider />

                      {/* Total Amount */}
                      <HStack justifyContent="space-between" alignItems="center">
                        <Text fontSize="lg" fontWeight="700">Total Amount:</Text>
                        <Text fontSize="xl" fontWeight="bold" color={color.primary}>
                          ৳{calculateAmount()}
                        </Text>
                      </HStack>
                    </VStack>

                    {formData.deliveryTypeMethod === 'Urgent' && (
                      <Text fontSize="xs" color={color.secondary} mt={2}>
                        *Urgent delivery processing time: 2-3 business days
                      </Text>
                    )}
                  </Box>
                </>
              )}
            </VStack>
          </ScrollView>
        </Modal.Body>

        <Modal.Footer bg={color.background}>
          <Button.Group space={2}>
            <Button
              variant="ghost"
              colorScheme="blueGray"
              onPress={handleClose}
              disabled={submitLoading}
            >
              Cancel
            </Button>
            <Button
              bg={color.primary}
              onPress={handleSubmit}
              isLoading={submitLoading}
              isLoadingText="Submitting..."
              _pressed={{ bg: color.primaryLight }}
              disabled={loading}
            >
              💳 Submit Application - ৳{calculateAmount()}
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default NewApplicationModal;
