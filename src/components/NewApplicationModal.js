import React, {useState, useEffect, useMemo, useCallback} from 'react';
import {
  Modal,
  VStack,
  HStack,
  Text,
  Button,
  FormControl,
  Input,
  Radio,
  useToast,
  Divider,
  ScrollView,
  Box,
  Checkbox,
} from 'native-base';
import {getPaymentHeads} from '../service/newEnrollmentService';
import {color} from '../service/utils';
import {
  getCompletedDegrees,
  getAllDepartments,
  getPrograms,
  getAllHalls,
  submitCertificateApplication,
} from '../service/applicationService';
import DropdownSelect from './DropdownSelect';

const DEFAULT_APPLICATION_FEE = 100;

const certificateTypes = [
  {label: 'Provisional', value: 'Provisional'},
  {label: 'Main', value: 'Main'},
];

const deliveryTypes = [
  {label: 'Regular', value: 'Regular'},
  {label: 'Emergency', value: 'Emergency'},
];

const reasonOptions = [
  {label: 'New Application', value: 'New Application'},
  {label: 'Lost or Stolen', value: 'Lost or Stolen'},
  {label: 'Information Updated', value: 'Information Updated'},
  {label: 'Destroyed', value: 'Destroyed'},
];

const countryOptions = [
  {label: 'Bangladesh', value: 'Bangladesh'},
  {label: 'India', value: 'India'},
  {label: 'Pakistan', value: 'Pakistan'},
  {label: 'United States', value: 'United States'},
  {label: 'United Kingdom', value: 'United Kingdom'},
  {label: 'Canada', value: 'Canada'},
  {label: 'Australia', value: 'Australia'},
  {label: 'Germany', value: 'Germany'},
  {label: 'France', value: 'France'},
  {label: 'Other', value: 'Other'},
];

const NewApplicationModal = ({
  isOpen,
  onClose,
  navigation,
  onApplicationSuccess,
  applicationType = 'CERTIFICATE',
}) => {
  const [loading, setLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [applicationFee, setApplicationFee] = useState(DEFAULT_APPLICATION_FEE);
  const [emergencyFee, setEmergencyFee] = useState(0);
  const [emailFee, setEmailFee] = useState(0);
  const [postalLocalFee, setPostalLocalFee] = useState(0);
  const [postalAbroadFee, setPostalAbroadFee] = useState(0);
  const [hallDevelopmentFee, setHallDevelopmentFee] = useState(0);
  const [envelopeFee, setEnvelopeFee] = useState(0);
  const [completedDegrees, setCompletedDegrees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [halls, setHalls] = useState([]);
  const toast = useToast();

  const [formData, setFormData] = useState({
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
    applicationType,
    admitCard: null,
    isShowPdf: true,
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

  const loadPaymentInfo = async () => {
    try {
      const response = await getPaymentHeads();
      if (response.success && response.data) {
        const heads = response.data;
        setEmergencyFee(0);
        setEnvelopeFee(0);

        const normalize = (value) =>
          typeof value === 'string' ? value.toLowerCase() : String(value || '').toLowerCase();

        const categoryHeads = heads.filter(head => head.category === applicationType);
        if (categoryHeads.length) {
          const baseHead = categoryHeads.find(head => {
            const name = normalize(head.name);
            if (!name) {
              return false;
            }
            if (name.includes('emergency')) {
              return false;
            }
            if (name.includes('envelop')) {
              return false;
            }
            if (name.includes('hall')) {
              return false;
            }
            return name.includes('fee') || name.includes(applicationType.toLowerCase());
          });
          setApplicationFee(baseHead ? baseHead.unit_price : DEFAULT_APPLICATION_FEE);

          const emergencyHead = categoryHeads.find(head => normalize(head.name).includes('emergency'));
          if (emergencyHead) {
            setEmergencyFee(emergencyHead.unit_price);
          }

          const envelopeHead = categoryHeads.find(head => {
            const name = normalize(head.name);
            return name.includes('envelop');
          });
          if (envelopeHead) {
            setEnvelopeFee(envelopeHead.unit_price);
          }
        } else {
          setApplicationFee(DEFAULT_APPLICATION_FEE);
        }

        const emailHead = heads.find(head => {
          const name = normalize(head.name);
          return name.includes('email') || name.includes('soft copy');
        });
        if (emailHead) {
          setEmailFee(emailHead.unit_price);
        }

        const postalLocalHead = heads.find(head => {
          const name = normalize(head.name);
          return name.includes('postal') && name.includes('local');
        });
        if (postalLocalHead) {
          setPostalLocalFee(postalLocalHead.unit_price);
        }

        const postalAbroadHead = heads.find(head => {
          const name = normalize(head.name);
          return name.includes('postal') && name.includes('abroad');
        });
        if (postalAbroadHead) {
          setPostalAbroadFee(postalAbroadHead.unit_price);
        }

        const hallHead = heads.find(head => {
          const name = normalize(head.name);
          return name.includes('hall') && name.includes('development');
        });
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

  const programOptions = useMemo(
    () =>
      programs
        .map(program => ({
          label: program.programsName,
          value: program.programsId ? program.programsId.toString() : '',
        }))
        .filter(option => option.value),
    [programs],
  );

  const degreeOptions = useMemo(() => {
    const formattedDegrees = completedDegrees
      .map(degree => {
        const id = degree.id ?? degree.degree?.id;
        if (!id) {
          return null;
        }

        const labelParts = [
          degree.degreeName ||
            degree.degree?.degree_name ||
            degree.subjectsTitle ||
            'Degree',
        ];

        const year = degree.examYear || degree.exam?.registered_exam_year;
        if (year) {
          labelParts.push(`(${year})`);
        }

        return {
          label: labelParts.join(' '),
          value: id.toString(),
        };
      })
      .filter(Boolean);

    return [
      ...formattedDegrees,
      {label: '🔸 My Degree not in listed', value: 'CUSTOM_DEGREE'},
    ];
  }, [completedDegrees]);

  const departmentOptions = useMemo(
    () =>
      departments
        .map(department => {
          const label =
            department.subjectsTitleEn ||
            department.subjectsTitle ||
            department.name ||
            'Unnamed Department';
          const valueSource = department.subjectsId ?? department.id;
          return {
            label,
            value: valueSource != null ? valueSource.toString() : '',
          };
        })
        .filter(option => option.value),
    [departments],
  );

  const hallOptions = useMemo(
    () =>
      halls
        .map(hall => {
          const label =
            hall.hallTitleEn || hall.hallTitle || hall.name || 'Unnamed Hall';
          const valueSource = hall.id ?? hall.hall_id;
          return {
            label,
            value: valueSource != null ? valueSource.toString() : '',
          };
        })
        .filter(option => option.value),
    [halls],
  );

  const handleInputChange = useCallback(
    (field, value) => {
      setFormData(prev => {
        const next = {...prev, [field]: value};

        if (field === 'examSelect') {
          if (value === 'CUSTOM_DEGREE') {
            next.isCustomDegree = true;
            next.isShowPdf = true;
            next.subjectName = '';
            next.subjectId = '';
            next.examYearSelect = '';
            next.examRollInput = '';
            next.program = '';
            next.department = '';
            next.hall = '';
          } else if (value) {
            next.isCustomDegree = false;
            const selectedDegree = completedDegrees.find(degree => {
              const degreeId = degree.id ?? degree.degree?.id;
              return degreeId?.toString() === value;
            });

            if (selectedDegree) {
              next.subjectName =
                selectedDegree.subjectsTitle ||
                selectedDegree.degree?.degree_name ||
                '';

              const subjectId =
                selectedDegree.subjectsId ??
                selectedDegree.degree?.subjects_id ??
                selectedDegree.subject_id ??
                selectedDegree.subject?.id;
              next.subjectId = subjectId != null ? subjectId.toString() : '';

              next.examYearSelect =
                selectedDegree.examYear ||
                selectedDegree.exam?.registered_exam_year ||
                '';
              next.examRollInput =
                selectedDegree.examRoll ||
                selectedDegree.exam?.registered_exam_roll ||
                '';

              const programId =
                selectedDegree.programsId ??
                selectedDegree.degree?.program_id ??
                selectedDegree.program_id;
              next.program = programId != null ? programId.toString() : '';

              const departmentId =
                selectedDegree.departmentId ??
                selectedDegree.department_id ??
                selectedDegree.subjectsId ??
                selectedDegree.degree?.subjects_id ??
                selectedDegree.department?.id;
              next.department =
                departmentId != null ? departmentId.toString() : '';

              const hallId =
                selectedDegree.hallId ??
                selectedDegree.hall_id ??
                selectedDegree.hall?.id;
              next.hall = hallId != null ? hallId.toString() : '';

              const resultFlag = (
                selectedDegree.all_result_available ||
                selectedDegree.allResultAvailable ||
                ''
              )
                .toString()
                .toUpperCase();
              next.isShowPdf = resultFlag !== 'YES';
            }
          } else {
            next.isCustomDegree = false;
          }
        }

        if (field === 'postalCountry') {
          next.postalType = value === 'Bangladesh' ? 'Local' : 'Abroad';
        }

        return next;
      });
    },
    [completedDegrees],
  );

  const validateForm = () => {
    const warn = description =>
      toast.show({
        description,
        status: 'warning',
      });

    if (!formData.program) {
      warn('Please select program');
      return false;
    }

    if (!formData.examSelect) {
      warn('Please select exam or degree');
      return false;
    }

    if (formData.isCustomDegree) {
      if (!formData.department) {
        warn('Please select department');
        return false;
      }

      if (!formData.examYearSelect) {
        warn('Please enter exam year');
        return false;
      }

      if (!formData.examRollInput) {
        warn('Please enter exam roll number');
        return false;
      }

      if (!formData.hall) {
        warn('Please select hall');
        return false;
      }
    }

    if (formData.isShowPdf && !formData.admitCard) {
      warn('Please upload admit card (PDF)');
      return false;
    }

    if (!formData.certificateType) {
      warn('Please select certificate type');
      return false;
    }

    if (!formData.deliveryTypeMethod) {
      warn('Please select delivery type');
      return false;
    }

    if (!formData.reasonOfApplication) {
      warn('Please select reason for application');
      return false;
    }

    if (
      !formData.overCounter &&
      !formData.emailDelivery &&
      !formData.postalMail
    ) {
      warn('Please select at least one delivery method');
      return false;
    }

    if (formData.overCounter) {
      if (!formData.overCounterName || !formData.overCounterMobile) {
        warn('Please fill receiver name and mobile for counter delivery');
        return false;
      }
    }

    if (formData.emailDelivery && !formData.emailAddress) {
      warn('Please enter email address for email delivery');
      return false;
    }

    if (formData.postalMail && !formData.postalAddress) {
      warn('Please enter postal address for mail delivery');
      return false;
    }

    return true;
  };

  const prepareFormData = () => {
    const submitData = new URLSearchParams();

    submitData.append('program', formData.program);
    submitData.append('examSelect', formData.examSelect);
    submitData.append('subject_name', formData.subjectName);
    submitData.append('subject_id', formData.subjectId);
    submitData.append('examYearSelect', formData.examYearSelect);
    submitData.append('examRollInput', formData.examRollInput);
    submitData.append('department', formData.department);
    submitData.append('hall', formData.hall);
    submitData.append('certificate_type', formData.certificateType);
    submitData.append('deliveryTypeMethod', formData.deliveryTypeMethod);
    submitData.append('reason_of_application', formData.reasonOfApplication);
    submitData.append('application_type', formData.applicationType);

    if (formData.overCounter) {
      submitData.append('overCounter', 'on');
      if (formData.isSelf) {
        submitData.append('isSelf', 'on');
      } else if (formData.isAuthorisedPerson) {
        submitData.append('isAuthorisedPerson', 'on');
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
      submitData.append('postalType', formData.postalType);
    }

    return submitData;
  };

  const totalAmount = useMemo(() => {
    const autoIncludeHallDevelopment =
      applicationType === 'CERTIFICATE' || applicationType === 'MARKSHEET';

    let total = applicationFee;

    if (formData.deliveryTypeMethod === 'Emergency') {
      total += emergencyFee > 0 ? emergencyFee : applicationFee;
    }

    if (
      hallDevelopmentFee > 0 &&
      (autoIncludeHallDevelopment || Boolean(formData.hall))
    ) {
      total += hallDevelopmentFee;
    }

    if (applicationType === 'TRANSCRIPT' && envelopeFee > 0) {
      total += envelopeFee;
    }

    if (formData.emailDelivery) {
      total += emailFee;
    }

    if (formData.postalMail) {
      total +=
        formData.postalType === 'Abroad' ? postalAbroadFee : postalLocalFee;
    }

    return total;
  }, [
    applicationFee,
    applicationType,
    emergencyFee,
    envelopeFee,
    emailFee,
    hallDevelopmentFee,
    postalAbroadFee,
    postalLocalFee,
    formData.deliveryTypeMethod,
    formData.emailDelivery,
    formData.hall,
    formData.postalMail,
    formData.postalType,
  ]);

  const baseFeeLabel = useMemo(() => {
    switch (applicationType) {
      case 'TRANSCRIPT':
        return 'Transcript Fee';
      case 'MARKSHEET':
        return 'Marksheet Fee';
      case 'CERTIFICATE':
      default:
        return 'Certificate Fee';
    }
  }, [applicationType]);

  const shouldShowHallDevelopment = useMemo(() => {
    const autoIncludeHallDevelopment =
      applicationType === 'CERTIFICATE' || applicationType === 'MARKSHEET';
    return (
      hallDevelopmentFee > 0 &&
      (autoIncludeHallDevelopment || Boolean(formData.hall))
    );
  }, [applicationType, formData.hall, hallDevelopmentFee]);

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

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setSubmitLoading(true);
    try {
      const submitData = prepareFormData();
      const response = await submitCertificateApplication(submitData);

      if (response.success) {
        toast.show({
          description:
            response.message || 'Application submitted successfully!',
          status: 'success',
        });

        handleClose();
        if (onApplicationSuccess) {
          onApplicationSuccess();
        }
      } else {
        toast.show({
          description: response.message || 'Failed to submit application',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.show({
        description: 'Failed to submit application. Please try again.',
        status: 'error',
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
      applicationType,
      admitCard: null,
      isShowPdf: true,
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
                  <FormControl isRequired>
                    <FormControl.Label>Completed Degree</FormControl.Label>
                    <DropdownSelect
                      value={formData.examSelect}
                      onValueChange={value =>
                        handleInputChange('examSelect', value)
                      }
                      placeholder="Select completed degree"
                      options={degreeOptions}
                      label="Completed Degree"
                    />
                  </FormControl>

                  {formData.isCustomDegree && (
                    <VStack space={3} bg={color.light} p={4} borderRadius={8}>
                      <Text
                        fontSize="sm"
                        fontWeight="600"
                        color={color.primary}>
                        📝 Enter Degree Information
                      </Text>
                      <FormControl isRequired>
                        <FormControl.Label>Program</FormControl.Label>
                        <DropdownSelect
                          value={formData.program}
                          onValueChange={value =>
                            handleInputChange('program', value)
                          }
                          placeholder="Select program"
                          options={programOptions}
                          label="Program"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormControl.Label>Department</FormControl.Label>
                        <DropdownSelect
                          value={formData.department}
                          onValueChange={value =>
                            handleInputChange('department', value)
                          }
                          placeholder="Select department"
                          options={departmentOptions}
                          label="Department"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormControl.Label>Exam Year</FormControl.Label>
                        <Input
                          value={formData.examYearSelect}
                          onChangeText={value =>
                            handleInputChange('examYearSelect', value)
                          }
                          placeholder="Enter exam year (e.g., 2020)"
                          keyboardType="numeric"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormControl.Label>Roll Number</FormControl.Label>
                        <Input
                          value={formData.examRollInput}
                          onChangeText={value =>
                            handleInputChange('examRollInput', value)
                          }
                          placeholder="Enter roll number"
                          keyboardType="numeric"
                        />
                      </FormControl>

                      <FormControl isRequired>
                        <FormControl.Label>Hall</FormControl.Label>
                        <DropdownSelect
                          value={formData.hall}
                          onValueChange={value =>
                            handleInputChange('hall', value)
                          }
                          placeholder="Select hall"
                          options={hallOptions}
                          label="Hall"
                        />
                      </FormControl>
                      <FormControl isRequired>
                        <FormControl.Label>Admit Card (PDF)</FormControl.Label>
                        <Button
                          variant="outline"
                          onPress={() => {
                            toast.show({
                              description:
                                'PDF file picker will be implemented',
                              status: 'info',
                            });
                          }}
                          leftIcon={<Text>📄</Text>}
                          borderColor={
                            formData.admitCard ? 'green.500' : 'gray.300'
                          }
                          _text={{
                            color: formData.admitCard
                              ? 'green.600'
                              : 'gray.600',
                          }}>
                          {formData.admitCard
                            ? 'PDF Uploaded ✓'
                            : 'Choose PDF File'}
                        </Button>
                        <Text fontSize="xs" color="gray.600" mt={1}>
                          Upload your admit card in PDF format
                        </Text>
                      </FormControl>
                    </VStack>
                  )}

                  <FormControl isRequired>
                    <FormControl.Label>Certificate Type</FormControl.Label>
                    <DropdownSelect
                      value={formData.certificateType}
                      onValueChange={value =>
                        handleInputChange('certificateType', value)
                      }
                      placeholder="Select certificate type"
                      options={certificateTypes}
                      label="Certificate Type"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label>Delivery Type</FormControl.Label>
                    <DropdownSelect
                      value={formData.deliveryTypeMethod}
                      onValueChange={value =>
                        handleInputChange('deliveryTypeMethod', value)
                      }
                      placeholder="Select delivery type"
                      options={deliveryTypes}
                      label="Delivery Type"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label>
                      Reason for Application
                    </FormControl.Label>
                    <DropdownSelect
                      value={formData.reasonOfApplication}
                      onValueChange={value =>
                        handleInputChange('reasonOfApplication', value)
                      }
                      placeholder="Select reason"
                      options={reasonOptions}
                      label="Reason for Application"
                    />
                  </FormControl>

                  <Divider />

                  <FormControl>
                    <FormControl.Label>
                      Delivery Methods (Select at least one)
                    </FormControl.Label>

                    <VStack space={3} mt={2}>
                      <Checkbox
                        isChecked={formData.overCounter}
                        onChange={value =>
                          handleInputChange('overCounter', value)
                        }
                        value="overCounter">
                        Over the Counter
                      </Checkbox>

                      {formData.overCounter && (
                        <VStack
                          space={3}
                          pl={6}
                          bg={color.secondaryBackground}
                          p={3}
                          borderRadius={8}>
                          <Text fontSize="sm" fontWeight="600">
                            Collection Type
                          </Text>

                          <Radio.Group
                            name="collectionType"
                            value={formData.isSelf ? 'self' : 'authorised'}
                            onChange={value => {
                              handleInputChange('isSelf', value === 'self');
                              handleInputChange(
                                'isAuthorisedPerson',
                                value === 'authorised',
                              );
                            }}>
                            <VStack space={2}>
                              <Radio value="self">Self Collection</Radio>
                              <Radio value="authorised">
                                Authorised Person
                              </Radio>
                            </VStack>
                          </Radio.Group>


                          {!formData.isSelf && (
<>
                          <FormControl isRequired>
                            <FormControl.Label>
                              {formData.isSelf
                                ? 'Your Name'
                                : 'Authorised Person Name'}
                            </FormControl.Label>
                            <Input
                              value={formData.overCounterName}
                              onChangeText={value =>
                                handleInputChange('overCounterName', value)
                              }
                              placeholder={
                                formData.isSelf
                                  ? 'Enter your name'
                                  : "Enter authorised person's name"
                              }
                            />
                          </FormControl>

                          <FormControl isRequired>
                            <FormControl.Label>
                              {formData.isSelf
                                ? 'Your Mobile'
                                : 'Authorised Person Mobile'}
                            </FormControl.Label>
                            <Input
                              value={formData.overCounterMobile}
                              onChangeText={value =>
                                handleInputChange('overCounterMobile', value)
                              }
                              placeholder={
                                formData.isSelf
                                  ? 'Enter your mobile number'
                                  : "Enter authorised person's mobile"
                              }
                              keyboardType="phone-pad"
                            />
                          </FormControl>

                            <FormControl>
                              <FormControl.Label>
                                Photo Upload (Optional)
                              </FormControl.Label>
                              <Button
                                variant="outline"
                                onPress={() => {
                                  toast.show({
                                    description:
                                      'Photo upload feature will be implemented',
                                    status: 'info',
                                  });
                                }}
                                leftIcon={<Text>📷</Text>}>
                                {formData.photoUpload
                                  ? 'Change Photo'
                                  : 'Upload Photo'}
                              </Button>
                            </FormControl>
                            </>
                          )}
                        </VStack>
                      )}
                    </VStack>

                    <VStack space={3} mt={4}>
                      <Checkbox
                        isChecked={formData.emailDelivery}
                        onChange={value =>
                          handleInputChange('emailDelivery', value)
                        }
                        value="emailDelivery">
                        Email Delivery
                      </Checkbox>

                      {formData.emailDelivery && (
                        <VStack
                          pl={6}
                          bg={color.secondaryBackground}
                          p={3}
                          borderRadius={8}>
                          <FormControl isRequired>
                            <FormControl.Label>Email Address</FormControl.Label>
                            <Input
                              value={formData.emailAddress}
                              onChangeText={value =>
                                handleInputChange('emailAddress', value)
                              }
                              placeholder="Enter email address"
                              keyboardType="email-address"
                            />
                          </FormControl>
                        </VStack>
                      )}
                    </VStack>

                    <VStack space={3} mt={4}>
                      <Checkbox
                        isChecked={formData.postalMail}
                        onChange={value =>
                          handleInputChange('postalMail', value)
                        }
                        value="postalMail">
                        Postal Mail
                      </Checkbox>

                      {formData.postalMail && (
                        <VStack
                          space={3}
                          pl={6}
                          bg={color.secondaryBackground}
                          p={3}
                          borderRadius={8}>
                          <FormControl isRequired>
                            <FormControl.Label>Country</FormControl.Label>
                            <DropdownSelect
                              value={formData.postalCountry}
                              onValueChange={value =>
                                handleInputChange('postalCountry', value)
                              }
                              placeholder="Select country"
                              options={countryOptions}
                              label="Country"
                            />
                          </FormControl>

                          {formData.postalCountry !== 'Bangladesh' && (
                            <Box bg="amber.100" p={2} borderRadius={6}>
                              <Text fontSize="xs" color="amber.800">
                                📮 International delivery selected - additional
                                charges apply
                              </Text>
                            </Box>
                          )}

                          <FormControl isRequired>
                            <FormControl.Label>
                              Complete Postal Address
                            </FormControl.Label>
                            <Input
                              value={formData.postalAddress}
                              onChangeText={value =>
                                handleInputChange('postalAddress', value)
                              }
                              placeholder="Enter complete postal address with postal code"
                              multiline
                              numberOfLines={4}
                            />
                          </FormControl>
                        </VStack>
                      )}
                    </VStack>
                  </FormControl>

                  <Box bg={color.light} p={4} borderRadius={8}>
                    <Text fontSize="md" fontWeight="600" mb={3}>
                      💰 Charges Breakdown
                    </Text>

                    <VStack space={2}>
                      <HStack justifyContent="space-between">
                        <Text fontSize="sm">{baseFeeLabel}:</Text>
                        <Text fontSize="sm" fontWeight="500">৳{applicationFee}</Text>
                      </HStack>

                      {formData.deliveryTypeMethod === 'Emergency' && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">Emergency Processing Fee:</Text>
                          <Text fontSize="sm" fontWeight="500">
                            ৳{(emergencyFee > 0 ? emergencyFee : applicationFee).toFixed(2)}
                          </Text>
                        </HStack>
                      )}

                      {shouldShowHallDevelopment && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">Hall Development Fee:</Text>
                          <Text fontSize="sm" fontWeight="500">
                            ৳{hallDevelopmentFee}
                          </Text>
                        </HStack>
                      )}

                      {applicationType === 'TRANSCRIPT' && envelopeFee > 0 && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">Transcript Envelope Fee:</Text>
                          <Text fontSize="sm" fontWeight="500">৳{envelopeFee}</Text>
                        </HStack>
                      )}

                      {formData.emailDelivery && emailFee > 0 && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">Email Delivery Fee:</Text>
                          <Text fontSize="sm" fontWeight="500">
                            ৳{emailFee}
                          </Text>
                        </HStack>
                      )}

                      {formData.postalMail && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm">
                            Postal Mail ({formData.postalType}):
                          </Text>
                          <Text fontSize="sm" fontWeight="500">
                            ৳
                            {formData.postalType === 'Abroad'
                              ? postalAbroadFee
                              : postalLocalFee}
                          </Text>
                        </HStack>
                      )}

                      {formData.overCounter && (
                        <HStack justifyContent="space-between">
                          <Text fontSize="sm" color="green.600">
                            Over Counter Delivery:
                          </Text>
                          <Text
                            fontSize="sm"
                            fontWeight="500"
                            color="green.600">
                            FREE
                          </Text>
                        </HStack>
                      )}

                      <Divider />

                      <HStack
                        justifyContent="space-between"
                        alignItems="center">
                        <Text fontSize="lg" fontWeight="700">
                          Total Charge:
                        </Text>
                        <Text
                          fontSize="xl"
                          fontWeight="bold"
                          color={color.primary}>
                          ৳{totalAmount.toFixed(2)}
                        </Text>
                      </HStack>
                    </VStack>

                    {formData.deliveryTypeMethod === 'Emergency' && (
                      <Text fontSize="xs" color={color.secondary} mt={2}>
                        *Emergency processing: 2-3 business days
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
              disabled={submitLoading}>
              Cancel
            </Button>
            <Button
              bg={color.primary}
              onPress={handleSubmit}
              isLoading={submitLoading}
              isLoadingText="Submitting..."
              _pressed={{bg: color.primaryLight}}
              disabled={loading}>
              💳 Submit Application - ৳{totalAmount.toFixed(2)}
            </Button>
          </Button.Group>
        </Modal.Footer>
      </Modal.Content>
    </Modal>
  );
};

export default NewApplicationModal;
