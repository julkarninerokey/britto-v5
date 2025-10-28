import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import { Box, Button, Fab, HStack, Icon, ScrollView, Skeleton, Text, VStack } from 'native-base';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import AppBar from '../../components/AppBar';
import { color } from '../../service/utils';
import { getMyProctorReports } from '../../service/proctorService';

const StatusBadge = ({ status }) => {
  const map = {
    SUBMITTED: { bg: color.info, label: 'Submitted' },
    REVIEWING: { bg: color.warning, label: 'Reviewing' },
    RESOLVED: { bg: color.success, label: 'Resolved' },
    REJECTED: { bg: color.danger, label: 'Rejected' },
  };
  const s = map[status] || map.SUBMITTED;
  return (
    <Box bg={s.bg} px={2} py={1} borderRadius={8}>
      <Text color="white" fontSize="xs" fontWeight="700">{s.label}</Text>
    </Box>
  );
};

const ReportCard = ({ item }) => (
  <Box bg={color.background} p={4} borderRadius={12} borderWidth={1} borderColor={color.light} mb={3}>
    <HStack justifyContent="space-between" alignItems="center">
      <VStack>
        <Text fontSize="md" fontWeight="700" color={color.text}>{item.category}</Text>
        <Text fontSize="xs" color={color.muted}>{new Date(item.createdAt).toLocaleString()}</Text>
        {item.note ? (
          <Text fontSize="xs" color={color.secondary} mt={1} numberOfLines={2}>{item.note}</Text>
        ) : null}
      </VStack>
      <StatusBadge status={item.status} />
    </HStack>
  </Box>
);

const ProctorScreen = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    (async () => {
      const res = await getMyProctorReports();
      if (res.success) setReports(res.data);
      setLoading(false);
    })();
  }, []);

  return (
    <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
      <AppBar title="Proctor Report" />
      <VStack flex={1} p={4}>
        {loading ? (
          <VStack space={3}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} bg={color.background} p={4} borderRadius={12}>
                <Skeleton.Text lines={2} />
              </Box>
            ))}
          </VStack>
        ) : reports && reports.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack>
              {reports.map((r) => <ReportCard key={r.id} item={r} />)}
            </VStack>
          </ScrollView>
        ) : (
          <VStack flex={1} alignItems="center" justifyContent="center" space={3}>
            <Text fontSize="lg" color={color.text}>No reports yet</Text>
            <Text fontSize="sm" color={color.muted} textAlign="center">
              If you witness misconduct or an emergency, report it to the Proctor.
            </Text>
          </VStack>
        )}

        <Fab
          renderInPortal={false}
          icon={<Icon as={MaterialIcons} name="videocam" color="white" />}
          bg={color.primary}
          onPress={() => navigation.navigate('NewProctorReport')}
          position="absolute"
          bottom={6}
          right={6}
          _pressed={{ bg: color.primaryLight }}
        />
      </VStack>
    </View>
  );
};

export default ProctorScreen;

