import { useCallback, useMemo } from 'react';
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
  Divider,
  Badge,
  BadgeText,
} from '@gluestack-ui/themed';
import { useAuth } from '@/context/AuthContext';
import { useToyRotator } from '@/context/ToyRotatorContext';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { PremiumBanner } from '@/components/PremiumBanner';

export default function DashboardScreen() {
  const { user, userProfile, profileLoading } = useAuth();
  const {
    children,
    childrenLoading,
    selectedChild,
    setSelectedChild,
    toys,
    toysLoading,
    currentRotation,
    rotationsLoading,
    refreshChildren,
    refreshToys,
    refreshRotations,
    isPaidUser,
  } = useToyRotator();
  const router = useRouter();

  useScreenTracking('Dashboard');

  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'User';
  const isLoading = childrenLoading || toysLoading || rotationsLoading || profileLoading;

  const onRefresh = useCallback(async () => {
    await Promise.all([refreshChildren(), refreshToys(), refreshRotations()]);
  }, [refreshChildren, refreshToys, refreshRotations]);

  // Stats
  const stats = useMemo(() => {
    const activeToys = toys.filter((t) => t.status === 'active').length;
    const restingToys = toys.filter((t) => t.status === 'resting').length;
    const totalToys = toys.filter((t) => t.status !== 'retired').length;
    return { activeToys, restingToys, totalToys };
  }, [toys]);

  // Rotation countdown
  const daysRemaining = useMemo(() => {
    if (!currentRotation) return null;
    const end = new Date(currentRotation.endDate);
    const now = new Date();
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, diff);
  }, [currentRotation]);

  // Active rotation toys
  const rotationToys = useMemo(() => {
    if (!currentRotation) return [];
    return toys.filter((t) => currentRotation.toyIds.includes(t.id));
  }, [currentRotation, toys]);

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} />}
    >
      <Box p="$5" pb="$10">
        <VStack space="lg">
          {/* Welcome Header */}
          <VStack space="xs">
            <Heading size="2xl" color="$textLight900" $dark-color="$textDark50">
              Hi, {profileLoading ? '...' : displayName}!
            </Heading>
            <Text size="md" color="$textLight500" $dark-color="$textDark400">
              Less clutter, more play
            </Text>
          </VStack>

          {/* Child Selector */}
          {children.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <HStack space="sm">
                {children.map((child) => {
                  const isSelected = selectedChild?.id === child.id;
                  return (
                    <Pressable key={child.id} onPress={() => setSelectedChild(child)}>
                      <Box
                        px="$4"
                        py="$2"
                        borderRadius="$full"
                        bg={isSelected ? '$primary500' : '$backgroundLight200'}
                        $dark-bg={isSelected ? '$primary600' : '$backgroundDark700'}
                        borderWidth={isSelected ? 0 : 1}
                        borderColor="$borderLight200"
                        $dark-borderColor="$borderDark600"
                      >
                        <Text
                          size="sm"
                          fontWeight={isSelected ? '$bold' : '$normal'}
                          color={isSelected ? '$white' : '$textLight700'}
                          $dark-color={isSelected ? '$white' : '$textDark300'}
                        >
                          {child.name}
                        </Text>
                      </Box>
                    </Pressable>
                  );
                })}
              </HStack>
            </ScrollView>
          )}

          {/* Empty State - No Children */}
          {children.length === 0 && !childrenLoading && (
            <Box
              bg="$backgroundLight100"
              $dark-bg="$backgroundDark800"
              p="$6"
              borderRadius="$xl"
              alignItems="center"
            >
              <VStack space="md" alignItems="center">
                <FontAwesome name="child" size={48} color="#94a3b8" />
                <Heading size="lg" textAlign="center">
                  Add Your First Child
                </Heading>
                <Text size="sm" color="$textLight500" textAlign="center">
                  Get started by adding a child profile to begin organizing toys
                </Text>
                <Button
                  size="md"
                  onPress={() => router.push('/(tabs)/profile')}
                  bg="$primary500"
                  mt="$2"
                >
                  <ButtonText>Go to Profile</ButtonText>
                </Button>
              </VStack>
            </Box>
          )}

          {/* Quick Stats */}
          {stats.totalToys > 0 && (
            <HStack space="sm">
              <StatCard icon="cube" iconColor="#3b82f6" label="Active" value={stats.activeToys} />
              <StatCard icon="moon-o" iconColor="#f59e0b" label="Resting" value={stats.restingToys} />
              <StatCard icon="archive" iconColor="#64748b" label="Total" value={stats.totalToys} />
            </HStack>
          )}

          {/* Current Rotation Card */}
          {selectedChild && currentRotation && (
            <Pressable onPress={() => router.push(`/rotation-detail?id=${currentRotation.id}` as any)}>
              <Box
                bg="$backgroundLight50"
                $dark-bg="$backgroundDark800"
                borderRadius="$xl"
                borderWidth={1}
                borderColor="$borderLight200"
                $dark-borderColor="$borderDark700"
                overflow="hidden"
              >
                <HStack
                  bg="$primary500"
                  $dark-bg="$primary700"
                  px="$4"
                  py="$3"
                  justifyContent="space-between"
                  alignItems="center"
                >
                  <HStack space="sm" alignItems="center">
                    <FontAwesome name="refresh" size={16} color="#fff" />
                    <Text color="$white" fontWeight="$bold" size="md">
                      Current Rotation
                    </Text>
                  </HStack>
                  {daysRemaining !== null && (
                    <Badge bg="$white" borderRadius="$full" px="$3" py="$1">
                      <BadgeText color="$primary500" fontWeight="$bold" size="sm">
                        {daysRemaining === 0 ? 'Ends today' : `${daysRemaining}d left`}
                      </BadgeText>
                    </Badge>
                  )}
                </HStack>

                <VStack p="$4" space="sm">
                  <Text size="sm" color="$textLight500" $dark-color="$textDark400">
                    {rotationToys.length} toys for {selectedChild.name}
                  </Text>
                  <HStack flexWrap="wrap" space="xs">
                    {rotationToys.slice(0, 6).map((toy) => (
                      <Box
                        key={toy.id}
                        bg="$backgroundLight200"
                        $dark-bg="$backgroundDark700"
                        px="$3"
                        py="$1"
                        borderRadius="$full"
                        mb="$1"
                      >
                        <Text size="xs" color="$textLight700" $dark-color="$textDark300">
                          {toy.name}
                        </Text>
                      </Box>
                    ))}
                    {rotationToys.length > 6 && (
                      <Box px="$3" py="$1">
                        <Text size="xs" color="$textLight500">+{rotationToys.length - 6} more</Text>
                      </Box>
                    )}
                  </HStack>

                  {currentRotation.insightSummary && (
                    <>
                      <Divider my="$1" />
                      <HStack space="sm" alignItems="flex-start">
                        <FontAwesome name="lightbulb-o" size={14} color="#f59e0b" />
                        <Text size="xs" color="$textLight600" $dark-color="$textDark400" flex={1}>
                          {currentRotation.insightSummary}
                        </Text>
                      </HStack>
                    </>
                  )}
                </VStack>
              </Box>
            </Pressable>
          )}

          {/* No rotation prompt */}
          {selectedChild && !currentRotation && !rotationsLoading && toys.length > 0 && (
            <Box
              bg="$backgroundLight100"
              $dark-bg="$backgroundDark800"
              p="$5"
              borderRadius="$xl"
              alignItems="center"
            >
              <VStack space="md" alignItems="center">
                <FontAwesome name="refresh" size={40} color="#3b82f6" />
                <Heading size="md" textAlign="center">No Active Rotation</Heading>
                <Text size="sm" color="$textLight500" textAlign="center">
                  Create a rotation for {selectedChild.name} to get started!
                </Text>
                <Button
                  size="md"
                  onPress={() => router.push('/create-rotation' as any)}
                  bg="$primary500"
                  mt="$2"
                >
                  <ButtonText>Create Rotation</ButtonText>
                </Button>
              </VStack>
            </Box>
          )}

          {/* No toys prompt */}
          {selectedChild && toys.length === 0 && !toysLoading && (
            <Box
              bg="$backgroundLight100"
              $dark-bg="$backgroundDark800"
              p="$5"
              borderRadius="$xl"
              alignItems="center"
            >
              <VStack space="md" alignItems="center">
                <FontAwesome name="cube" size={40} color="#f59e0b" />
                <Heading size="md" textAlign="center">Add Your Toys</Heading>
                <Text size="sm" color="$textLight500" textAlign="center">
                  Start by adding toys to your library
                </Text>
                <Button
                  size="md"
                  onPress={() => router.push('/add-toy' as any)}
                  bg="$primary500"
                  mt="$2"
                >
                  <ButtonText>Add First Toy</ButtonText>
                </Button>
              </VStack>
            </Box>
          )}

          {/* Premium Upsell */}
          {!isPaidUser && children.length > 0 && (
            <PremiumBanner
              description="Unlock AI toy scanning, smart rotation suggestions & space analysis"
            />
          )}

          {/* Quick Actions */}
          {children.length > 0 && (
            <>
              <Heading size="md" color="$textLight900" $dark-color="$textDark50" mt="$2">
                Quick Actions
              </Heading>
              <HStack space="sm" flexWrap="wrap">
                <QuickAction
                  icon="plus-circle"
                  label="Add Toy"
                  color="#3b82f6"
                  onPress={() => router.push('/add-toy' as any)}
                />
                <QuickAction
                  icon="refresh"
                  label="New Rotation"
                  color="#10b981"
                  onPress={() => router.push('/create-rotation' as any)}
                />
                <QuickAction
                  icon="magic"
                  label="Scan Toy"
                  color="#8b5cf6"
                  onPress={() => router.push('/scan-toy' as any)}
                />
              </HStack>
              <HStack space="sm" flexWrap="wrap" mt="$1">
                <QuickAction
                  icon="camera"
                  label="Space Analysis"
                  color="#ec4899"
                  onPress={() => router.push('/analyze-space' as any)}
                />
                <QuickAction
                  icon="child"
                  label="Add Child"
                  color="#f59e0b"
                  onPress={() => router.push('/(tabs)/profile')}
                />
                <QuickAction
                  icon="users"
                  label="Caregivers"
                  color="#6366f1"
                  onPress={() => router.push('/(tabs)/profile')}
                />
              </HStack>
            </>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
}

function StatCard({
  icon,
  iconColor,
  label,
  value,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  iconColor: string;
  label: string;
  value: number;
}) {
  return (
    <Box
      flex={1}
      bg="$backgroundLight50"
      $dark-bg="$backgroundDark800"
      p="$4"
      borderRadius="$xl"
      borderWidth={1}
      borderColor="$borderLight200"
      $dark-borderColor="$borderDark700"
      alignItems="center"
    >
      <FontAwesome name={icon} size={20} color={iconColor} />
      <Text size="2xl" fontWeight="$bold" color="$textLight900" $dark-color="$textDark50" mt="$1">
        {value}
      </Text>
      <Text size="xs" color="$textLight500" $dark-color="$textDark400">
        {label}
      </Text>
    </Box>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} flex={1} minWidth={100}>
      <Box
        bg="$backgroundLight50"
        $dark-bg="$backgroundDark800"
        p="$4"
        borderRadius="$xl"
        borderWidth={1}
        borderColor="$borderLight200"
        $dark-borderColor="$borderDark700"
        alignItems="center"
      >
        <FontAwesome name={icon} size={24} color={color} />
        <Text size="xs" mt="$2" color="$textLight700" $dark-color="$textDark300" fontWeight="$medium">
          {label}
        </Text>
      </Box>
    </Pressable>
  );
}
