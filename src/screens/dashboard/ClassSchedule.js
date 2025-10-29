import React, { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Box, HStack, Pressable, ScrollView, Text, VStack } from 'native-base';
import AppBar from '../../components/AppBar';
import { color, dashboardButtons } from '../../service/utils';
import { getWeeklyClassSchedule } from '../../service/classScheduleService';
import IconList from '../../components/IconList';

const DAYS = ['Saturday', 'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday'];

const ClassRow = ({ cls, icon }) => {
  const sub = [`${cls.startTime} – ${cls.endTime}`, `Room: ${cls.room}`, `Teacher: ${cls.teacher}`].join('  |  ');
  return (
    <IconList icon={icon} heading={cls.course} subHeading={sub} />
  );
};

const DayChip = ({ label, active, onPress }) => (
  <Pressable onPress={onPress}>
    <Box px={3} py={2} mr={2} borderRadius={10} bg={active ? color.primary : color.background} borderWidth={1} borderColor={active ? color.primary : color.light}>
      <Text color={active ? 'white' : color.text} fontSize="xs" fontWeight="600">{label.slice(0,3)}</Text>
    </Box>
  </Pressable>
);

const ClassSchedule = () => {
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [dayIndex, setDayIndex] = useState(new Date().getDay());
  const [iconUrl, setIconUrl] = useState('');

  useEffect(() => {
    (async () => {
      const res = await getWeeklyClassSchedule();
      if (res.success) setSchedule(res.data);
      const ico = dashboardButtons.find((i) => i.screen === 'ClassSchedule')?.icon;
      if (ico) setIconUrl(ico);
      setLoading(false);
    })();
  }, []);

  const classes = useMemo(() => {
    if (!schedule) return [];
    const key = DAYS[dayIndex];
    return schedule.week[key] || [];
  }, [schedule, dayIndex]);

  return (
    <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
      <AppBar title="Class Schedule" />
      <VStack flex={1} p={1}space={2} >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} height={1} mt={2} mb={-8}>
          <HStack p={2} m={2} h={50} alignItems="center">
            {DAYS.map((d, idx) => (
              <DayChip key={d} label={d} active={idx === dayIndex} onPress={() => setDayIndex(idx)} />
            ))}
          </HStack>
        </ScrollView>

        {/* List */}
        {loading ? (
          <VStack space={2}>
            {[...Array(3)].map((_, i) => (
              <Box key={i} bg={color.background} borderRadius={8} p={4} borderWidth={1} borderColor={color.light}>
                <Box h={3} bg={color.lightBlue} borderRadius={6} mb={2} />
                <Box h={3} w="70%" bg={color.lightBlue} borderRadius={6} />
              </Box>
            ))}
          </VStack>
        ) : classes.length ? (
          <ScrollView >
            <VStack w="100%" alignItems="flex-start" p={1} style={{borderColor: color.light, borderWidth: 1, borderRadius: 12}}>
              {classes.map((c) => (
                <ClassRow key={c.id} cls={c} icon={iconUrl} />
              ))}
            </VStack>
          </ScrollView>
        ) : (
          <Box flex={1} alignItems="center" justifyContent="center" py={10}>
            <Text fontSize="sm" color={color.muted}>No classes for {DAYS[dayIndex]}.</Text>
          </Box>
        )}
      </VStack>
    </View>
  );
};

export default ClassSchedule;

