import { useEffect, useMemo, useState } from 'react';
import { View } from 'react-native';
import { Box, HStack, Input, Pressable, ScrollView, Text, VStack, Image } from 'native-base';
import AppBar from '../../components/AppBar';
import { color, dashboardButtons } from '../../service/utils';
import { getBusSchedules } from '../../service/busService';
import { getFavorites, toggleFavorite } from '../../service/busFavorites';
import IconList from '../../components/IconList';


const BusSchedule = ({ navigation }) => {
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [items, setItems] = useState([]);
  const [favs, setFavs] = useState([]);
  const [iconUrl, setIconUrl] = useState('');
  const [expanded, setExpanded] = useState(new Set());

  useEffect(() => {
    (async () => {
      const res = await getBusSchedules();
      if (res.success) setItems(res.data);
      setFavs(await getFavorites());
      try {
          const busScheduleIcon = dashboardButtons.find((item) => item.screen === 'BusSchedule')?.icon;
          if (busScheduleIcon) setIconUrl(busScheduleIcon);
      } catch (_) {}
      setLoading(false);
    })();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((b) => (
      b.busName.toLowerCase().includes(q) ||
      b.startPlace.toLowerCase().includes(q) ||
      b.endPlace.toLowerCase().includes(q) ||
      b.stops.some((s) => s.toLowerCase().includes(q))
    ));
  }, [items, query]);

  const ordered = useMemo(() => {
    if (!favs.length) return filtered;
    const favSet = new Set(favs);
    return [...filtered].sort((a, b) => {
      const af = favSet.has(a.id) ? 0 : 1;
      const bf = favSet.has(b.id) ? 0 : 1;
      if (af !== bf) return af - bf;
      return a.busName.localeCompare(b.busName);
    });
  }, [filtered, favs]);

  const onToggleFavorite = async (id) => {
    const next = await toggleFavorite(id);
    setFavs(next);
  };

  return (
    <View style={{ flex: 1, backgroundColor: color.secondaryBackground }}>
      <AppBar title="Bus Schedule" />
      <VStack p={4} space={3} flex={1}>
        <Input
          placeholder="Search by bus name, place, stop…"
          value={query}
          onChangeText={setQuery}
          variant="filled"
          bg={color.background}
          borderColor={color.light}
          _focus={{ borderColor: color.primary }}
          InputLeftElement={iconUrl ? (
            <Image source={{ uri: iconUrl }} alt="bus" width={5} height={5} ml={3} resizeMode="contain" />
          ) : undefined}
        />

        {loading ? (
          <VStack space={3}>
            {[...Array(5)].map((_, i) => (
              <Box key={i} bg={color.background} borderRadius={12} borderWidth={1} borderColor={color.light} p={4}>
                <Box h={4} bg={color.lightBlue} borderRadius={6} mb={2} />
                <Box h={3} bg={color.lightBlue} borderRadius={6} w="70%" />
              </Box>
            ))}
          </VStack>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <VStack w="100%" alignItems="flex-start" p={2}>
              {ordered.map((b) => {
                const fav = favs.includes(b.id);
                const stopsPreview = (b.stops && b.stops.length)
                  ? (b.stops.length > 5 ? `${b.stops.slice(0,5).join(' • ')} …` : b.stops.join(' • '))
                  : '';
                const sub = [
                  b.servesArea || b.notes || '',
                  [b.startTime && `Start: ${b.startTime}`, b.downTime && `Down: ${b.downTime}`].filter(Boolean).join('   '),
                  (b.startPlace || b.endPlace) ? `${b.startPlace || '—'} → ${b.endPlace || 'University of Dhaka'}` : '',
                  stopsPreview ? `Stops: ${stopsPreview}` : '',
                  (b.driver?.name || b.driver?.phone) ? `Driver: ${[b.driver?.name, b.driver?.phone].filter(Boolean).join(' • ')}` : '',
                  (b.president?.name || b.president?.phone) ? `President: ${[b.president?.name, b.president?.phone].filter(Boolean).join(' • ')}` : '',
                ].filter(Boolean).join('  |  ');
                const isOpen = expanded.has(b.id);
                const toggle = () => {
                  const next = new Set(expanded);
                  if (next.has(b.id)) next.delete(b.id); else next.add(b.id);
                  setExpanded(next);
                };
                return (
                  <VStack key={b.id} w="100%">
                    <IconList
                      icon={iconUrl}
                      heading={b.busName}
                      subHeading={sub}
                      onPress={toggle}
                      onLongPress={() => onToggleFavorite(b.id)}
                      isFavorite={fav}
                      onToggleFavorite={() => onToggleFavorite(b.id)}
                    />
                    {isOpen ? (
                      <Box bg={color.background} p={4} borderLeftWidth={4} borderColor={color.primary} borderRadius={8} mb={2}>
                        <VStack space={2}>
                          {b.notes ? (
                            <VStack>
                              <Text fontSize="xs" color={color.secondary}>Route</Text>
                              <Text fontSize="xs" color={color.text}>{b.notes}</Text>
                            </VStack>
                          ) : null}
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={color.secondary}>Days</Text>
                            <Text fontSize="xs" color={color.text}>{b.days || 'Sun–Thu'}</Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={color.secondary}>Start</Text>
                            <Text fontSize="xs" color={color.text}>{b.startTime || '—'}</Text>
                          </HStack>
                          <HStack justifyContent="space-between">
                            <Text fontSize="xs" color={color.secondary}>Down</Text>
                            <Text fontSize="xs" color={color.text}>{b.downTime || '—'}</Text>
                          </HStack>
                          {(b.startPlace || b.endPlace) ? (
                            <HStack justifyContent="space-between">
                              <Text fontSize="xs" color={color.secondary}>Route</Text>
                              <Text fontSize="xs" color={color.text}>{`${b.startPlace || '—'} → ${b.endPlace || 'University of Dhaka'}`}</Text>
                            </HStack>
                          ) : null}
                          {b.stops && b.stops.length ? (
                            <VStack>
                              <Text fontSize="xs" color={color.secondary}>Stops</Text>
                              <Text fontSize="xs" color={color.text}>{b.stops.join(' • ')}</Text>
                            </VStack>
                          ) : null}
                        </VStack>
                      </Box>
                    ) : null}
                  </VStack>
                );
              })}
              {ordered.length === 0 ? (
                <Box alignItems="center" py={10}>
                  <Text fontSize="sm" color={color.muted}>No buses match your search.</Text>
                </Box>
              ) : null}
            </VStack>
          </ScrollView>
        )}
      </VStack>
    </View>
  );
};

export default BusSchedule;
