import React, { useState } from 'react';
import { View } from 'react-native';
import { Box, Button, HStack, Icon, Input, Select, Spinner, Text, TextArea, VStack } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppBar from '../../components/AppBar';
import { color, toast } from '../../service/utils';
import { submitProctorReportDraft } from '../../service/proctorService';

const categories = [
  'Harassment',
  'Vandalism',
  'Theft',
  'Assault',
  'Suspicious Activity',
  'Other',
];

const StepHeader = ({ step }) => (
  <HStack space={2} alignItems="center" mb={3}>
    {[1,2,3].map((s) => (
      <Box key={s} flex={1} h={1.5} borderRadius={2} bg={s <= step ? color.primary : color.light} />
    ))}
  </HStack>
);

const NewProctorReport = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [videoURI, setVideoURI] = useState(null);
  const [category, setCategory] = useState('Suspicious Activity');
  const [note, setNote] = useState('');

  const next = () => setStep((s) => Math.min(3, s + 1));
  const back = () => setStep((s) => Math.max(1, s - 1));

  const pickVideoMock = async () => {
    // Placeholder: integrate react-native-image-picker or vision-camera later
    setVideoURI('mock://video/path');
    toast('info', 'Video Selected', 'Sample 30s clip added (placeholder).');
    next();
  };

  const handleSubmit = async () => {
    if (!videoURI) {
      toast('warning', 'Missing video', 'Please attach a 30s video.');
      setStep(2);
      return;
    }
    setBusy(true);
    const res = await submitProctorReportDraft({ videoURI, category, note });
    setBusy(false);
    if (res.success) {
      toast('success', 'Report Submitted', `Reference: ${res.id}`);
      navigation.goBack();
    } else {
      toast('danger', 'Submission Failed', res.message || 'Please try again.');
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
      <AppBar title="New Report" />
      <VStack flex={1} p={4} space={3}>
        <StepHeader step={step} />

        {step === 1 && (
          <Box bg={color.background} p={4} borderRadius={12} borderWidth={1} borderColor={color.light}>
            <VStack space={3}>
              <Text fontSize="md" fontWeight="700" color={color.text}>Before you proceed</Text>
              <Text fontSize="sm" color={color.muted}>• If anyone is in immediate danger, call emergency services.</Text>
              <Text fontSize="sm" color={color.muted}>• Record only if it is safe. Do not approach suspects.</Text>
              <Text fontSize="sm" color={color.muted}>• False reporting may result in disciplinary action.</Text>
              <HStack space={3} mt={2}>
                <Button flex={1} variant="outline" borderColor={color.primary} _text={{ color: color.primary }} onPress={() => navigation.goBack()}>Cancel</Button>
                <Button flex={1} bg={color.primary} _pressed={{ bg: color.primaryLight }} onPress={next}>I Understand</Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {step === 2 && (
          <Box bg={color.background} p={4} borderRadius={12} borderWidth={1} borderColor={color.light}>
            <VStack space={3}>
              <Text fontSize="md" fontWeight="700" color={color.text}>Record 30s Video</Text>
              <Text fontSize="xs" color={color.muted}>Front/back camera • Max 30 seconds • Keep yourself safe</Text>
              <Button leftIcon={<Icon as={MaterialIcons} name="videocam" color="white" />} bg={color.primary} _pressed={{ bg: color.primaryLight }} onPress={pickVideoMock}>
                Record / Pick Video (Mock)
              </Button>
              {videoURI ? (
                <Box mt={2} p={3} bg={color.lightBlue} borderRadius={8}>
                  <Text fontSize="xs" color={color.text}>Attached: sample clip (placeholder)</Text>
                </Box>
              ) : null}
              <HStack space={3} mt={2}>
                <Button flex={1} variant="outline" borderColor={color.primary} _text={{ color: color.primary }} onPress={back}>Back</Button>
                <Button flex={1} bg={color.primary} _pressed={{ bg: color.primaryLight }} onPress={next}>Next</Button>
              </HStack>
            </VStack>
          </Box>
        )}

        {step === 3 && (
          <Box bg={color.background} p={4} borderRadius={12} borderWidth={1} borderColor={color.light}>
            <VStack space={3}>
              <Text fontSize="md" fontWeight="700" color={color.text}>Details</Text>
              <Select selectedValue={category} onValueChange={setCategory} borderColor={color.light}>
                {categories.map((c) => (
                  <Select.Item key={c} value={c} label={c} />
                ))}
              </Select>
              <TextArea
                value={note}
                onChangeText={setNote}
                numberOfLines={4}
                placeholder="(Optional) Add a short note"
                borderColor={color.light}
                _focus={{ borderColor: color.primary }}
                maxLength={250}
              />
              <HStack space={3} mt={2}>
                <Button flex={1} variant="outline" borderColor={color.primary} _text={{ color: color.primary }} onPress={back}>Back</Button>
                <Button flex={1} isLoading={busy} bg={color.primary} _pressed={{ bg: color.primaryLight }} onPress={handleSubmit}>Submit</Button>
              </HStack>
            </VStack>
          </Box>
        )}
      </VStack>
    </View>
  );
};

export default NewProctorReport;

