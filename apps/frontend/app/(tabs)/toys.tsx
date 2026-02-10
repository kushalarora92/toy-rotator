import { useState, useMemo, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { useRouter } from 'expo-router';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Pressable,
  Badge,
  BadgeText,
  Input,
  InputField,
} from '@gluestack-ui/themed';
import { useToyRotator } from '@/context/ToyRotatorContext';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { Toy, ToyCategory, ToyStatus, TOY_CATEGORIES } from '@my-app/types';

const STATUS_FILTERS: { label: string; value: ToyStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Resting', value: 'resting' },
  { label: 'Retired', value: 'retired' },
];

const STATUS_COLORS: Record<ToyStatus, { bg: string; text: string; icon: string }> = {
  active: { bg: '#dcfce7', text: '#166534', icon: '#22c55e' },
  resting: { bg: '#fef9c3', text: '#854d0e', icon: '#eab308' },
  retired: { bg: '#f1f5f9', text: '#64748b', icon: '#94a3b8' },
};

const CATEGORY_ICONS: Record<string, React.ComponentProps<typeof FontAwesome>['name']> = {
  'Building & Construction': 'building',
  'Pretend Play & Imagination': 'magic',
  'Arts & Crafts': 'paint-brush',
  'Puzzles & Problem Solving': 'puzzle-piece',
  'Vehicles & Transport': 'car',
  'Dolls & Figures': 'child',
  'Musical & Sound': 'music',
  'Outdoor & Active Play': 'futbol-o',
  'Books & Learning': 'book',
  'Sensory & Comfort': 'hand-paper-o',
  'Other': 'ellipsis-h',
};

export default function ToyLibraryScreen() {
  const { toys, toysLoading, refreshToys } = useToyRotator();
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<ToyStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ToyCategory | null>(null);

  useScreenTracking('ToyLibrary');

  const onRefresh = useCallback(async () => {
    await refreshToys();
  }, [refreshToys]);

  const filteredToys = useMemo(() => {
    let result = [...toys];

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((t) => t.status === statusFilter);
    }

    // Category filter
    if (selectedCategory) {
      result = result.filter((t) => t.category === selectedCategory);
    }

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q) ||
          t.skillTags?.some((tag) => tag.toLowerCase().includes(q))
      );
    }

    // Sort: active first, then resting, then retired
    const statusOrder: Record<ToyStatus, number> = { active: 0, resting: 1, retired: 2 };
    result.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);

    return result;
  }, [toys, statusFilter, selectedCategory, searchQuery]);

  // Categories present in toys
  const usedCategories = useMemo(() => {
    const cats = new Set(toys.map((t) => t.category));
    return TOY_CATEGORIES.filter((c) => cats.has(c));
  }, [toys]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={toysLoading} onRefresh={onRefresh} />}
    >
      <Box p="$5" pb="$10">
        <VStack space="md">
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Heading size="xl" color="$textLight900" $dark-color="$textDark50">
                Toy Library
              </Heading>
              <Text size="sm" color="$textLight500" $dark-color="$textDark400">
                {toys.filter((t) => t.status !== 'retired').length} toys
              </Text>
            </VStack>
            <HStack space="sm">
              <Pressable
                onPress={() => router.push('/scan-toy' as any)}
              >
                <Box
                  width={40}
                  height={40}
                  borderRadius={20}
                  bg="$violet100"
                  $dark-bg="$violet900"
                  justifyContent="center"
                  alignItems="center"
                >
                  <FontAwesome name="magic" size={16} color="#8b5cf6" />
                </Box>
              </Pressable>
              <Button
                size="md"
                onPress={() => router.push('/add-toy' as any)}
                bg="$primary500"
                borderRadius="$full"
              >
                <HStack space="xs" alignItems="center">
                  <FontAwesome name="plus" size={14} color="#fff" />
                  <ButtonText>Add Toy</ButtonText>
                </HStack>
              </Button>
            </HStack>
          </HStack>

          {/* Search */}
          <Input borderRadius="$xl" bg="$backgroundLight100" $dark-bg="$backgroundDark800">
            <Box pl="$3" justifyContent="center">
              <FontAwesome name="search" size={14} color="#94a3b8" />
            </Box>
            <InputField
              placeholder="Search toys..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </Input>

          {/* Status Filter */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <HStack space="sm">
              {STATUS_FILTERS.map((f) => {
                const isActive = statusFilter === f.value;
                return (
                  <Pressable key={f.value} onPress={() => setStatusFilter(f.value)}>
                    <Box
                      px="$4"
                      py="$2"
                      borderRadius="$full"
                      bg={isActive ? '$primary500' : '$backgroundLight200'}
                      $dark-bg={isActive ? '$primary600' : '$backgroundDark700'}
                    >
                      <Text
                        size="sm"
                        fontWeight={isActive ? '$bold' : '$normal'}
                        color={isActive ? '$white' : '$textLight700'}
                        $dark-color={isActive ? '$white' : '$textDark300'}
                      >
                        {f.label}
                      </Text>
                    </Box>
                  </Pressable>
                );
              })}
            </HStack>
          </ScrollView>

          {/* Category Filter */}
          {usedCategories.length > 1 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space="xs">
                <Pressable onPress={() => setSelectedCategory(null)}>
                  <Box
                    px="$3"
                    py="$1"
                    borderRadius="$full"
                    borderWidth={1}
                    borderColor={!selectedCategory ? '$primary500' : '$borderLight300'}
                    $dark-borderColor={!selectedCategory ? '$primary400' : '$borderDark600'}
                    bg={!selectedCategory ? '$primary50' : 'transparent'}
                    $dark-bg={!selectedCategory ? '$primary900' : 'transparent'}
                  >
                    <Text
                      size="xs"
                      color={!selectedCategory ? '$primary500' : '$textLight600'}
                      $dark-color={!selectedCategory ? '$primary300' : '$textDark400'}
                    >
                      All
                    </Text>
                  </Box>
                </Pressable>
                {usedCategories.map((cat) => {
                  const isActive = selectedCategory === cat;
                  return (
                    <Pressable key={cat} onPress={() => setSelectedCategory(isActive ? null : cat)}>
                      <Box
                        px="$3"
                        py="$1"
                        borderRadius="$full"
                        borderWidth={1}
                        borderColor={isActive ? '$primary500' : '$borderLight300'}
                        $dark-borderColor={isActive ? '$primary400' : '$borderDark600'}
                        bg={isActive ? '$primary50' : 'transparent'}
                        $dark-bg={isActive ? '$primary900' : 'transparent'}
                      >
                        <Text
                          size="xs"
                          color={isActive ? '$primary500' : '$textLight600'}
                          $dark-color={isActive ? '$primary300' : '$textDark400'}
                        >
                          {cat}
                        </Text>
                      </Box>
                    </Pressable>
                  );
                })}
              </HStack>
            </ScrollView>
          )}

          {/* Empty State */}
          {filteredToys.length === 0 && !toysLoading && (
            <Box
              bg="$backgroundLight100"
              $dark-bg="$backgroundDark800"
              p="$6"
              borderRadius="$xl"
              alignItems="center"
              mt="$4"
            >
              <VStack space="md" alignItems="center">
                <FontAwesome name="cube" size={48} color="#94a3b8" />
                <Heading size="lg" textAlign="center">
                  {toys.length === 0 ? 'No Toys Yet' : 'No Matches'}
                </Heading>
                <Text size="sm" color="$textLight500" textAlign="center">
                  {toys.length === 0
                    ? 'Add your first toy to get started with toy rotation!'
                    : 'Try adjusting your filters or search query'}
                </Text>
                {toys.length === 0 && (
                  <Button
                    size="md"
                    onPress={() => router.push('/add-toy' as any)}
                    bg="$primary500"
                    mt="$2"
                  >
                    <ButtonText>Add First Toy</ButtonText>
                  </Button>
                )}
              </VStack>
            </Box>
          )}

          {/* Toy Cards */}
          {filteredToys.map((toy) => (
            <ToyCard
              key={toy.id}
              toy={toy}
              onPress={() => router.push(`/add-toy?id=${toy.id}` as any)}
            />
          ))}
        </VStack>
      </Box>
    </ScrollView>
  );
}

function ToyCard({ toy, onPress }: { toy: Toy; onPress: () => void }) {
  const statusStyle = STATUS_COLORS[toy.status];
  const categoryIcon = CATEGORY_ICONS[toy.category] || 'cube';

  return (
    <Pressable onPress={onPress}>
      <Box
        bg="$backgroundLight50"
        $dark-bg="$backgroundDark800"
        borderRadius="$xl"
        borderWidth={1}
        borderColor="$borderLight200"
        $dark-borderColor="$borderDark700"
        p="$4"
      >
        <HStack space="md" alignItems="center">
          {/* Category Icon */}
          <Box
            width={48}
            height={48}
            borderRadius={12}
            bg="$backgroundLight200"
            $dark-bg="$backgroundDark700"
            justifyContent="center"
            alignItems="center"
          >
            <FontAwesome name={categoryIcon} size={20} color="#64748b" />
          </Box>

          {/* Info */}
          <VStack flex={1} space="xs">
            <HStack justifyContent="space-between" alignItems="center">
              <Text
                size="md"
                fontWeight="$bold"
                color="$textLight900"
                $dark-color="$textDark50"
                numberOfLines={1}
                flex={1}
              >
                {toy.name}
              </Text>
              <Box
                px="$2"
                py="$0.5"
                borderRadius="$full"
                bg={statusStyle.bg as any}
                ml="$2"
              >
                <Text size="2xs" color={statusStyle.text as any} fontWeight="$bold">
                  {toy.status.charAt(0).toUpperCase() + toy.status.slice(1)}
                </Text>
              </Box>
            </HStack>
            <Text size="xs" color="$textLight500" $dark-color="$textDark400">
              {toy.category}
            </Text>
            {toy.skillTags && toy.skillTags.length > 0 && (
              <HStack flexWrap="wrap" space="xs" mt="$1">
                {toy.skillTags.slice(0, 3).map((tag) => (
                  <Box
                    key={tag}
                    bg="$backgroundLight200"
                    $dark-bg="$backgroundDark700"
                    px="$2"
                    py="$0.5"
                    borderRadius="$full"
                  >
                    <Text size="2xs" color="$textLight600" $dark-color="$textDark400">
                      {tag}
                    </Text>
                  </Box>
                ))}
                {toy.skillTags.length > 3 && (
                  <Text size="2xs" color="$textLight400">
                    +{toy.skillTags.length - 3}
                  </Text>
                )}
              </HStack>
            )}
          </VStack>

          {/* Chevron */}
          <FontAwesome name="chevron-right" size={12} color="#94a3b8" />
        </HStack>
      </Box>
    </Pressable>
  );
}
