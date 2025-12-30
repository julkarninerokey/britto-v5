import React, {useEffect, useState} from 'react';
import {Image, Platform} from 'react-native';
import {
  Box,
  Button,
  Center,
  CheckIcon,
  FormControl,
  Heading,
  HStack,
  Input,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  Select,
  Spinner,
  Text,
  VStack,
} from 'native-base';
import axios from 'axios';
import {Calendar} from 'react-native-calendars';
import {API_CONFIG} from '../config/api';
import {color, toast} from '../service/utils';
import {login} from '../service/auth';

const publicApi = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  headers: {
    'Content-Type': API_CONFIG.HEADERS.CONTENT_TYPE,
  },
});

const REGISTRATION_ENDPOINTS = {
  sessions: '/student/get-sessions',
  subjectsByInstitutionType: institutionTypeId =>
    `/teacher/get-subjects-by-institution-type/${institutionTypeId}`,
  institutionsByType: institutionTypeId =>
    `/teacher/get-institution-by-type/${institutionTypeId}`,
  halls: '/student/get-all-halls',
  checkCollegeStudent: '/student/check-college-student',
  studentValidate: '/student/student-validate',
  register: '/student/registration',
};

const isNumeric = value => /^\d+$/.test(value);
const isValidEmail = value => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidDate = value => /^\d{4}-\d{2}-\d{2}$/.test(value);

const normalizeDateValue = value => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  if (/^\d{8}$/.test(value)) {
    return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
  }
  return value;
};

const getList = (data, keys = []) => {
  if (!data || typeof data !== 'object') {
    return [];
  }

  if (Array.isArray(data)) {
    return data;
  }

  for (const key of keys) {
    if (Array.isArray(data[key])) {
      return data[key];
    }
  }

  return [];
};

const StudentRegistrationScreen = ({navigation}) => {
  const [formData, setFormData] = useState({
    institution_type_id: '10000',
    date_of_birth: '',
    admitted_student_reg_no: '',
    admitted_student_email: '',
    student_english_name: '',
    session_id: '',
    college: '',
    department: '',
    student_bangla_name: '',
    admitted_student_contact_no: '',
    password: '',
    confirm_pass: '',
  });

  const [sessions, setSessions] = useState([]);
  const [programs, setPrograms] = useState([]);
  const [halls, setHalls] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [selectedProgram, setSelectedProgram] = useState(null);
  const [selectedHall, setSelectedHall] = useState(null);
  const [selectedCollege, setSelectedCollege] = useState(null);
  const [lockedFields, setLockedFields] = useState({});
  const [studentInfo, setStudentInfo] = useState(null);

  const [step, setStep] = useState('form');
  const [otp, setOtp] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loadingMeta, setLoadingMeta] = useState(false);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [showCalendar, setShowCalendar] = useState(false);

  const updateField = (field, value) => {
    setFormData(prev => ({...prev, [field]: value}));
  };

  const today = new Date().toISOString().slice(0, 10);

  const handleCalendarSelect = day => {
    if (day?.dateString) {
      updateField('date_of_birth', day.dateString);
    }
    setShowCalendar(false);
  };

  const emailError =
    formData.admitted_student_email &&
    !isValidEmail(formData.admitted_student_email)
      ? 'Please enter a valid email address'
      : '';

  const regNumberError =
    formData.admitted_student_reg_no &&
    formData.admitted_student_reg_no.length !== 10
      ? 'Registration number must be 10 digits'
      : '';

  const confirmPassError =
    formData.confirm_pass && formData.confirm_pass !== formData.password
      ? 'Passwords do not match'
      : '';

  const isCollegeFlow = formData.institution_type_id === '1';
  const isHallFlow = formData.institution_type_id === '10000';
  const requiresSubjectAndSession =
    formData.institution_type_id && formData.institution_type_id !== '10000';

  const normalizeSessions = data =>
    getList(data, ['data', 'sessions'])
      .map(item => ({
        id: item.session_id ?? item.id ?? item.value ?? '',
        name: item.session_name ?? item.name ?? item.label ?? '',
      }))
      .filter(item => item.id && item.name);

  const normalizePrograms = data =>
    getList(data, ['data', 'subjects', 'programs'])
      .map(item => ({
        id: item.subjects_id ?? item.id ?? item.value ?? '',
        name: item.subjects_title ?? item.subjects_title_en ?? item.name ?? '',
      }))
      .filter(item => item.id && item.name);

  const normalizeHalls = data =>
    getList(data, ['data', 'halls'])
      .map(item => ({
        id: item.id ?? item.hall_id ?? item.value ?? '',
        name: item.hall_title_en ?? item.hall_title ?? item.name ?? '',
      }))
      .filter(item => item.id && item.name);

  const normalizeColleges = data =>
    getList(data, ['data', 'colleges'])
      .map(item => ({
        id: item.id ?? item.college_id ?? item.value ?? '',
        name: item.college_name ?? item.name ?? item.label ?? '',
      }))
      .filter(item => item.id && item.name);

  const loadRegistrationMeta = async (showToast = false) => {
    if (!REGISTRATION_ENDPOINTS.sessions) {
      return;
    }

    setLoadingMeta(true);
    try {
      const sessionRes = await publicApi.get(REGISTRATION_ENDPOINTS.sessions);
      setSessions(normalizeSessions(sessionRes.data));
    } catch (error) {
      console.error('Registration meta error:', error);
      if (showToast) {
        toast('danger', 'Failed to load registration lists.');
      }
    } finally {
      setLoadingMeta(false);
    }
  };

  const loadPrograms = async institutionTypeId => {
    if (!REGISTRATION_ENDPOINTS.subjectsByInstitutionType) {
      return;
    }

    setLoadingOptions(true);
    try {
      const res = await publicApi.get(
        REGISTRATION_ENDPOINTS.subjectsByInstitutionType(institutionTypeId),
      );
      setPrograms(normalizePrograms(res.data));
    } catch (error) {
      console.error('Programs fetch error:', error);
      setPrograms([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadHalls = async () => {
    if (!REGISTRATION_ENDPOINTS.halls) {
      return;
    }

    setLoadingOptions(true);
    try {
      const res = await publicApi.get(REGISTRATION_ENDPOINTS.halls);
      setHalls(normalizeHalls(res.data));
    } catch (error) {
      console.error('Halls fetch error:', error);
      setHalls([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const loadColleges = async institutionTypeId => {
    if (!REGISTRATION_ENDPOINTS.institutionsByType) {
      return;
    }

    setLoadingOptions(true);
    try {
      const res = await publicApi.get(
        REGISTRATION_ENDPOINTS.institutionsByType(institutionTypeId),
      );
      setColleges(normalizeColleges(res.data));
    } catch (error) {
      console.error('Colleges fetch error:', error);
      setColleges([]);
    } finally {
      setLoadingOptions(false);
    }
  };

  const reloadLists = () => {
    loadRegistrationMeta(true);
    const typeId = Number(formData.institution_type_id);
    if (typeId) {
      loadPrograms(typeId);
      if (formData.institution_type_id === '10000') {
        loadHalls();
      } else {
        loadColleges(typeId);
      }
    }
  };

  useEffect(() => {
    loadRegistrationMeta();
  }, []);

  useEffect(() => {
    if (!formData.institution_type_id) {
      return;
    }

    const typeId = Number(formData.institution_type_id);
    if (Number.isNaN(typeId)) {
      return;
    }

    setPrograms([]);
    setHalls([]);
    setColleges([]);
    setSelectedProgram(null);
    setSelectedHall(null);
    setSelectedCollege(null);
    setStudentInfo(null);
    setLockedFields({});
    setFormData(prev => ({
      ...prev,
      department: '',
      college: '',
      session_id: '',
    }));

    loadPrograms(typeId);
    if (formData.institution_type_id === '10000') {
      loadHalls();
    } else {
      loadColleges(typeId);
    }
  }, [formData.institution_type_id]);

  const handleSendOtp = async () => {
    const trimmedEmail = formData.admitted_student_email.trim();
    if (!formData.admitted_student_reg_no || !isNumeric(formData.admitted_student_reg_no)) {
      toast('danger', 'Valid Registration No is required.');
      return;
    }

    if (formData.admitted_student_reg_no.length !== 10) {
      toast('danger', 'Registration No must be 10 digits.');
      return;
    }

    if (!formData.date_of_birth || !isValidDate(formData.date_of_birth)) {
      toast('danger', 'Enter Date of Birth as YYYY-MM-DD.');
      return;
    }

    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast('danger', 'Please enter a valid email address.');
      return;
    }

    if (requiresSubjectAndSession) {
      if (!formData.session_id || !isNumeric(formData.session_id)) {
        toast('danger', 'Session is required.');
        return;
      }
      if (!selectedProgram) {
        toast('danger', 'Subject is required.');
        return;
      }
    }

    setSendingOtp(true);
    try {
      const response = await publicApi.post(
        API_CONFIG.ENDPOINTS.SEND_LOGIN_OTP,
        {email: trimmedEmail},
      );

      if (response.data?.status) {
        setOtp('');
        setStep('otp');
        toast('success', response.data?.message || 'OTP sent successfully.');
      } else {
        toast('danger', response.data?.message || 'Failed to send OTP.');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      toast('danger', 'Unable to send OTP. Please try again.');
    } finally {
      setSendingOtp(false);
    }
  };

  const lookupCollegeStudent = async () => {
    if (!REGISTRATION_ENDPOINTS.checkCollegeStudent) {
      return;
    }

    const institutionTypeId = Number(formData.institution_type_id);
    if (!institutionTypeId || !selectedProgram || !formData.session_id) {
      return;
    }

    try {
      const payload = {
        institution_type_id: institutionTypeId,
        subjects_id: Number(selectedProgram),
        session_id: Number(formData.session_id),
        admitted_student_reg_no: Number(formData.admitted_student_reg_no),
      };

      const response = await publicApi.post(
        REGISTRATION_ENDPOINTS.checkCollegeStudent,
        payload,
      );

      if (response.data?.status && response.data?.data) {
        const stud = response.data.data;
        const nextLocked = {};
        const normalizedProgramId = stud.subjects_id ?? stud.dept ?? null;
        const normalizedCollegeId = stud.registered_college_id ?? null;

        setFormData(prev => ({
          ...prev,
          student_english_name: stud.enm || prev.student_english_name,
          student_bangla_name: stud.bnm || prev.student_bangla_name,
          department: stud.edn || stud.bdn || prev.department,
          session_id: stud.session_id ? String(stud.session_id) : prev.session_id,
          college: stud.COLLEGE_NAME || prev.college,
          date_of_birth:
            normalizeDateValue(stud.ADMITTED_STUDENT_DOB) || prev.date_of_birth,
        }));

        setStudentInfo({
          student_name: stud.enm,
          subjects_title_en: stud.edn || stud.bdn,
          subjects_id: normalizedProgramId ?? undefined,
          registered_college_id: normalizedCollegeId ?? undefined,
          college_name: stud.COLLEGE_NAME,
          student_dob: stud.ADMITTED_STUDENT_DOB,
        });

        if (stud.enm) nextLocked.student_english_name = true;
        if (stud.bnm) nextLocked.student_bangla_name = true;
        if (stud.edn || stud.bdn) nextLocked.department = true;
        if (stud.session_id) nextLocked.session_id = true;
        if (stud.COLLEGE_NAME || stud.registered_college_id)
          nextLocked.college = true;
        if (stud.ADMITTED_STUDENT_DOB) nextLocked.date_of_birth = true;
        setSelectedProgram(
          normalizedProgramId ? String(normalizedProgramId) : selectedProgram,
        );
        if (normalizedCollegeId) {
          setSelectedCollege(String(normalizedCollegeId));
        }
        setLockedFields(nextLocked);
      }
    } catch (error) {
      console.error('College lookup error:', error);
    }
  };

  const lookupHallStudent = async () => {
    if (!REGISTRATION_ENDPOINTS.studentValidate) {
      return;
    }

    try {
      const payload = {
        sid: formData.admitted_student_reg_no.toString(),
        dob: formData.date_of_birth.replace(/-/g, ''),
      };

      const response = await publicApi.post(
        REGISTRATION_ENDPOINTS.studentValidate,
        payload,
      );

      const stud = response.data?.data?.reply?.students?.student;
      if (response.data?.status && stud) {
        const nextLocked = {};
        let matchedSessionId = null;
        if (stud.sid && sessions.length) {
          const sidSession = String(stud.sid).substring(2, 4);
          const sidNumber = Number(sidSession) + 1;
          const matchedSession = sessions.find(session =>
            String(session.name).slice(-2) === String(sidNumber),
          );
          if (matchedSession) {
            matchedSessionId = String(matchedSession.id);
            nextLocked.session_id = true;
          }
        }

        setStudentInfo({
          student_name: stud.enm,
          hall_id: isNumeric(stud.hall) ? Number(stud.hall) : undefined,
          subjects_title_en: stud.edn,
          subjects_id: isNumeric(stud.PROG) ? Number(stud.PROG) : undefined,
        });

        setFormData(prev => ({
          ...prev,
          student_english_name: stud.enm || prev.student_english_name,
          student_bangla_name: stud.bnm || prev.student_bangla_name,
          department: stud.edn || prev.department,
          session_id: matchedSessionId || prev.session_id,
        }));

        if (stud.enm) nextLocked.student_english_name = true;
        if (stud.bnm) nextLocked.student_bangla_name = true;
        if (stud.edn) nextLocked.department = true;

        if (isNumeric(stud.PROG)) {
          setSelectedProgram(String(stud.PROG));
        }
        if (isNumeric(stud.hall)) {
          setSelectedHall(String(stud.hall));
          nextLocked.hall = true;
        }

        setLockedFields(nextLocked);
      }
    } catch (error) {
      console.error('Hall lookup error:', error);
    }
  };

  const handleVerifyOtp = async () => {
    const trimmedEmail = formData.admitted_student_email.trim();
    const trimmedOtp = otp.trim();
    if (!trimmedEmail || !isValidEmail(trimmedEmail)) {
      toast('danger', 'Please enter a valid email address.');
      return;
    }

    if (trimmedOtp.length !== 6) {
      toast('danger', 'Enter the 6-digit OTP.');
      return;
    }

    setVerifyingOtp(true);
    try {
      const response = await publicApi.post(
        API_CONFIG.ENDPOINTS.VERIFY_LOGIN_OTP,
        {
          email: trimmedEmail,
          otp: trimmedOtp,
          user_type: 'STUDENT',
          validation_for: 'NEW_USER',
        },
      );

      if (!response.data?.status) {
        toast('danger', response.data?.message || 'Invalid OTP.');
        return;
      }

      if (isCollegeFlow) {
        await lookupCollegeStudent();
      } else {
        await lookupHallStudent();
      }

      setStep('details');
    } catch (error) {
      console.error('OTP verify error:', error);
      toast('danger', 'Unable to verify OTP. Please try again.');
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleRegisterSubmit = async () => {
    if (!REGISTRATION_ENDPOINTS.register) {
      toast('danger', 'Registration endpoint is not configured.');
      return;
    }

    if (!formData.student_english_name) {
      toast('danger', 'Student English Name is required.');
      return;
    }

    if (!formData.student_bangla_name) {
      toast('danger', 'Student Bangla Name is required.');
      return;
    }

    if (!formData.session_id || !isNumeric(formData.session_id)) {
      toast('danger', 'Session is required.');
      return;
    }

    if (!selectedProgram) {
      toast('danger', 'Department is required.');
      return;
    }

    if (isHallFlow && !selectedHall && !lockedFields.hall) {
      toast('danger', 'Hall selection is required.');
      return;
    }

    if (!isHallFlow && !selectedCollege && !lockedFields.college) {
      toast('danger', 'College selection is required.');
      return;
    }

    if (!formData.admitted_student_contact_no || !isNumeric(formData.admitted_student_contact_no)) {
      toast('danger', 'Valid contact number is required.');
      return;
    }

    if (!formData.password || formData.password.length < 6) {
      toast('danger', 'Password must be at least 6 characters.');
      return;
    }

    if (formData.password !== formData.confirm_pass) {
      toast('danger', 'Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        institution_type_id: Number(formData.institution_type_id),
        email: formData.admitted_student_email.trim(),
        admitted_student_reg_no: Number(formData.admitted_student_reg_no),
        admitted_student_name:
          formData.student_english_name || studentInfo?.student_name,
        admitted_student_fathers_n: '',
        admitted_student_mothers_n: '',
        admitted_student_dob: studentInfo?.student_dob,
        session_id: formData.session_id ? Number(formData.session_id) : undefined,
        college_name: formData.college || undefined,
        department_name: formData.department || undefined,
      };

      if (typeof studentInfo?.registered_college_id === 'number') {
        payload.registered_college_id = studentInfo.registered_college_id;
      } else if (selectedCollege) {
        payload.registered_college_id = Number(selectedCollege);
      }

      if (typeof studentInfo?.subjects_id === 'number') {
        payload.subjects_id = studentInfo.subjects_id;
      } else if (selectedProgram) {
        payload.subjects_id = Number(selectedProgram);
      }

      if (typeof studentInfo?.hall_id === 'number') {
        payload.hall = studentInfo.hall_id;
      } else if (selectedHall) {
        payload.hall = Number(selectedHall);
      }

      const response = await publicApi.post(
        REGISTRATION_ENDPOINTS.register,
        payload,
      );

      if (response.data?.status || response.data?.success) {
        const authResponse = await login(
          formData.admitted_student_email.trim(),
          formData.password,
        );
        if (authResponse.success) {
          toast('success', 'Registration successful.');
          navigation.navigate('Dashboard');
        } else {
          toast(
            'warning',
            'Registration completed. Please sign in manually.',
          );
          navigation.navigate('Login');
        }
      } else {
        toast('danger', response.data?.message || 'Registration failed.');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast('danger', 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={{flex: 1}}>
      <ScrollView contentContainerStyle={{flexGrow: 1}}>
        <Center flex={1} bg={color.secondaryBackground}>
          <Box safeArea w="90%" p={6} bg={color.background}>
            <Image
              source={require('../assets/logo.png')}
              style={{width: 90, height: 120, marginBottom: 10}}
            />
            <Heading size="lg" fontWeight="600" color={color.primary}>
              Student Registration
            </Heading>
            <Text mt="2" textAlign="center" color={color.secondary}>
              Register to access the student portal.
            </Text>

            <Modal isOpen={showCalendar} onClose={() => setShowCalendar(false)}>
              <Modal.Content maxWidth="400px">
                <Modal.CloseButton />
                <Modal.Header>Select Date of Birth</Modal.Header>
                <Modal.Body>
                  <Calendar
                    current={
                      isValidDate(formData.date_of_birth)
                        ? formData.date_of_birth
                        : today
                    }
                    maxDate={today}
                    markedDates={
                      isValidDate(formData.date_of_birth)
                        ? {
                            [formData.date_of_birth]: {
                              selected: true,
                              selectedColor: color.primary,
                            },
                          }
                        : undefined
                    }
                    onDayPress={handleCalendarSelect}
                    theme={{
                      selectedDayBackgroundColor: color.primary,
                      todayTextColor: color.primary,
                      arrowColor: color.primary,
                    }}
                  />
                </Modal.Body>
              </Modal.Content>
            </Modal>

            <VStack space={3} mt="5" width="100%">
              {step === 'form' && (
                <VStack space={3}>
                  {requiresSubjectAndSession && (
                    <FormControl isRequired>
                      <FormControl.Label>Subject</FormControl.Label>
                      <Select
                        selectedValue={selectedProgram ?? ''}
                        placeholder="Select subject"
                        onValueChange={value => {
                          setSelectedProgram(value);
                          const match = programs.find(
                            program => String(program.id) === String(value),
                          );
                          updateField(
                            'department',
                            match?.name || formData.department,
                          );
                        }}
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={color.light}
                        bg={color.background}
                        _selectedItem={{
                          bg: color.light,
                          endIcon: <CheckIcon size="4" color={color.primary} />,
                        }}
                        isDisabled={loadingOptions || programs.length === 0}>
                        {programs.map(program => (
                          <Select.Item
                            key={program.id}
                            label={program.name}
                            value={String(program.id)}
                          />
                        ))}
                      </Select>
                      {loadingOptions && (
                        <FormControl.HelperText>
                          Loading subjects...
                        </FormControl.HelperText>
                      )}
                    </FormControl>
                  )}

                  {requiresSubjectAndSession && (
                    <FormControl isRequired>
                      <FormControl.Label>Session</FormControl.Label>
                      <Select
                        selectedValue={formData.session_id}
                        placeholder="Select session"
                        onValueChange={value =>
                          updateField('session_id', value)
                        }
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={color.light}
                        bg={color.background}
                        _selectedItem={{
                          bg: color.light,
                          endIcon: <CheckIcon size="4" color={color.primary} />,
                        }}>
                        {sessions.map(session => (
                          <Select.Item
                            key={session.id}
                            label={session.name}
                            value={String(session.id)}
                          />
                        ))}
                      </Select>
                      {!loadingMeta && sessions.length === 0 && (
                        <FormControl.HelperText>
                          Session list not loaded.
                        </FormControl.HelperText>
                      )}
                    </FormControl>
                  )}

                  <FormControl isRequired isInvalid={!!regNumberError}>
                    <FormControl.Label>Registration No</FormControl.Label>
                    <Input
                      value={formData.admitted_student_reg_no}
                      keyboardType="number-pad"
                      maxLength={10}
                      onChangeText={value =>
                        updateField(
                          'admitted_student_reg_no',
                          value.replace(/[^0-9]/g, ''),
                        )
                      }
                      isDisabled={!!lockedFields.admitted_student_reg_no}
                      placeholder="Enter 10-digit registration no"
                    />
                    {regNumberError ? (
                      <FormControl.ErrorMessage>
                        {regNumberError}
                      </FormControl.ErrorMessage>
                    ) : (
                      <FormControl.HelperText>
                        Registration number must be 10 digits.
                      </FormControl.HelperText>
                    )}
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label>Date of Birth</FormControl.Label>
                    <HStack space={2} alignItems="center">
                      <Input
                        flex={1}
                        value={formData.date_of_birth}
                        onChangeText={value =>
                          updateField('date_of_birth', value)
                        }
                        placeholder="YYYY-MM-DD"
                      />
                      <Button
                        variant="outline"
                        colorScheme="indigo"
                        onPress={() => setShowCalendar(true)}>
                        Calendar
                      </Button>
                    </HStack>
                    {!isValidDate(formData.date_of_birth) &&
                      formData.date_of_birth && (
                        <FormControl.ErrorMessage>
                          Use YYYY-MM-DD format.
                        </FormControl.ErrorMessage>
                      )}
                  </FormControl>

                  <FormControl isRequired isInvalid={!!emailError}>
                    <FormControl.Label>Email</FormControl.Label>
                    <Input
                      value={formData.admitted_student_email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={value =>
                        updateField('admitted_student_email', value)
                      }
                      placeholder="Enter your email"
                    />
                    {emailError ? (
                      <FormControl.ErrorMessage>
                        {emailError}
                      </FormControl.ErrorMessage>
                    ) : null}
                  </FormControl>


                  <Button
                    mt="2"
                    colorScheme="indigo"
                    bg={color.primary}
                    onPress={handleSendOtp}
                    isLoading={sendingOtp}
                    isDisabled={sendingOtp || verifyingOtp}>
                    Next
                  </Button>

                  <Button
                    variant="ghost"
                    colorScheme="indigo"
                    onPress={() => navigation.navigate('Login')}
                    isDisabled={sendingOtp || verifyingOtp}>
                    Already registered? Sign in
                  </Button>

                  <Button
                    variant="outline"
                    colorScheme="indigo"
                    onPress={reloadLists}
                    isDisabled={loadingMeta}>
                    {loadingMeta ? (
                      <HStack space={2} alignItems="center">
                        <Spinner size="sm" />
                        <Text>Reloading lists</Text>
                      </HStack>
                    ) : (
                      'Reload lists'
                    )}
                  </Button>
                </VStack>
              )}

              {step === 'otp' && (
                <VStack space={3}>
                  <Text textAlign="center">
                    Enter the 6-digit OTP sent to{' '}
                    {formData.admitted_student_email}
                  </Text>

                  <FormControl isRequired>
                    <FormControl.Label>OTP</FormControl.Label>
                    <Input
                      value={otp}
                      keyboardType="number-pad"
                      maxLength={6}
                      onChangeText={value =>
                        setOtp(value.replace(/[^0-9]/g, ''))
                      }
                      placeholder="Enter OTP"
                    />
                  </FormControl>

                  <Button
                    mt="2"
                    colorScheme="indigo"
                    bg={color.primary}
                    onPress={handleVerifyOtp}
                    isLoading={verifyingOtp}
                    isDisabled={verifyingOtp || otp.length !== 6}>
                    Verify & Continue
                  </Button>

                  <Button
                    variant="outline"
                    colorScheme="indigo"
                    onPress={handleSendOtp}
                    isDisabled={sendingOtp || verifyingOtp}>
                    Resend OTP
                  </Button>

                  <Button
                    variant="ghost"
                    colorScheme="indigo"
                    onPress={() => setStep('form')}
                    isDisabled={sendingOtp || verifyingOtp}>
                    Back to form
                  </Button>
                </VStack>
              )}

              {step === 'details' && (
                <VStack space={3}>
                  <FormControl isRequired>
                    <FormControl.Label>Student English Name</FormControl.Label>
                    <Input
                      value={formData.student_english_name}
                      onChangeText={value =>
                        updateField('student_english_name', value)
                      }
                      isDisabled={!!lockedFields.student_english_name}
                      placeholder="Enter full name"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label>Student Bangla Name</FormControl.Label>
                    <Input
                      value={formData.student_bangla_name}
                      onChangeText={value =>
                        updateField('student_bangla_name', value)
                      }
                      isDisabled={!!lockedFields.student_bangla_name}
                      placeholder="Enter Bangla name"
                    />
                  </FormControl>

                  {isCollegeFlow && (
                    <FormControl isRequired>
                      <FormControl.Label>Date of Birth</FormControl.Label>
                      <HStack space={2} alignItems="center">
                        <Input
                          flex={1}
                          value={formData.date_of_birth}
                          onChangeText={value =>
                            updateField('date_of_birth', value)
                          }
                          isDisabled={!!lockedFields.date_of_birth}
                          placeholder="YYYY-MM-DD"
                        />
                        <Button
                          variant="outline"
                          colorScheme="indigo"
                          onPress={() => setShowCalendar(true)}
                          isDisabled={!!lockedFields.date_of_birth}>
                          Calendar
                        </Button>
                      </HStack>
                      {!isValidDate(formData.date_of_birth) &&
                        formData.date_of_birth && (
                          <FormControl.ErrorMessage>
                            Use YYYY-MM-DD format.
                          </FormControl.ErrorMessage>
                        )}
                    </FormControl>
                  )}

                  {isHallFlow ? (
                    <FormControl isRequired>
                      <FormControl.Label>Hall</FormControl.Label>
                      <Select
                        selectedValue={selectedHall ?? ''}
                        placeholder="Select hall"
                        onValueChange={value => setSelectedHall(value)}
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={color.light}
                        bg={color.background}
                        _selectedItem={{
                          bg: color.light,
                          endIcon: <CheckIcon size="4" color={color.primary} />,
                        }}
                        isDisabled={!!lockedFields.hall}>
                        {halls.map(hall => (
                          <Select.Item
                            key={hall.id}
                            label={hall.name}
                            value={String(hall.id)}
                          />
                        ))}
                      </Select>
                      {!loadingOptions && halls.length === 0 && (
                        <FormControl.HelperText>
                          Hall list not loaded.
                        </FormControl.HelperText>
                      )}
                    </FormControl>
                  ) : (
                    <FormControl isRequired>
                      <FormControl.Label>College</FormControl.Label>
                      <Select
                        selectedValue={selectedCollege ?? ''}
                        placeholder="Select college"
                        onValueChange={value => {
                          setSelectedCollege(value);
                          const match = colleges.find(
                            college => String(college.id) === String(value),
                          );
                          updateField(
                            'college',
                            match?.name || formData.college,
                          );
                        }}
                        borderRadius={8}
                        borderWidth={1}
                        borderColor={color.light}
                        bg={color.background}
                        _selectedItem={{
                          bg: color.light,
                          endIcon: <CheckIcon size="4" color={color.primary} />,
                        }}
                        isDisabled={!!lockedFields.college}>
                        {colleges.map(college => (
                          <Select.Item
                            key={college.id}
                            label={college.name}
                            value={String(college.id)}
                          />
                        ))}
                      </Select>
                      {!loadingOptions && colleges.length === 0 && (
                        <FormControl.HelperText>
                          College list not loaded.
                        </FormControl.HelperText>
                      )}
                    </FormControl>
                  )}

                  <FormControl isRequired>
                    <FormControl.Label>Department</FormControl.Label>
                    <Select
                      selectedValue={selectedProgram ?? ''}
                      placeholder="Select department"
                      onValueChange={value => {
                        setSelectedProgram(value);
                        const match = programs.find(
                          program => String(program.id) === String(value),
                        );
                        updateField(
                          'department',
                          match?.name || formData.department,
                        );
                      }}
                      borderRadius={8}
                      borderWidth={1}
                      borderColor={color.light}
                      bg={color.background}
                      _selectedItem={{
                        bg: color.light,
                        endIcon: <CheckIcon size="4" color={color.primary} />,
                      }}
                      isDisabled={loadingOptions || !!lockedFields.department}>
                      {programs.map(program => (
                        <Select.Item
                          key={program.id}
                          label={program.name}
                          value={String(program.id)}
                        />
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label>Session</FormControl.Label>
                    <Select
                      selectedValue={formData.session_id}
                      placeholder="Select session"
                      onValueChange={value =>
                        updateField('session_id', value)
                      }
                      borderRadius={8}
                      borderWidth={1}
                      borderColor={color.light}
                      bg={color.background}
                      _selectedItem={{
                        bg: color.light,
                        endIcon: <CheckIcon size="4" color={color.primary} />,
                      }}
                      isDisabled={!!lockedFields.session_id}>
                      {sessions.map(session => (
                        <Select.Item
                          key={session.id}
                          label={session.name}
                          value={String(session.id)}
                        />
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label>Contact No</FormControl.Label>
                    <Input
                      value={formData.admitted_student_contact_no}
                      keyboardType="number-pad"
                      onChangeText={value =>
                        updateField(
                          'admitted_student_contact_no',
                          value.replace(/[^0-9]/g, ''),
                        )
                      }
                      placeholder="Enter contact number"
                    />
                  </FormControl>

                  <FormControl isRequired>
                    <FormControl.Label>Password</FormControl.Label>
                    <Input
                      type="password"
                      value={formData.password}
                      onChangeText={value => updateField('password', value)}
                      placeholder="Create a password"
                    />
                  </FormControl>

                  <FormControl isRequired isInvalid={!!confirmPassError}>
                    <FormControl.Label>Confirm Password</FormControl.Label>
                    <Input
                      type="password"
                      value={formData.confirm_pass}
                      onChangeText={value =>
                        updateField('confirm_pass', value)
                      }
                      placeholder="Confirm password"
                    />
                    {confirmPassError ? (
                      <FormControl.ErrorMessage>
                        {confirmPassError}
                      </FormControl.ErrorMessage>
                    ) : null}
                  </FormControl>


                  <Button
                    mt="2"
                    colorScheme="indigo"
                    bg={color.primary}
                    onPress={handleRegisterSubmit}
                    isLoading={submitting}
                    isDisabled={submitting}>
                    Submit Registration
                  </Button>

                  <Button
                    variant="ghost"
                    colorScheme="indigo"
                    onPress={() => navigation.navigate('Login')}
                    isDisabled={submitting}>
                    Already registered? Sign in
                  </Button>
                </VStack>
              )}
            </VStack>
          </Box>
        </Center>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default StudentRegistrationScreen;
