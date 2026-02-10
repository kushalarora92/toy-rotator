import { useMemo, useCallback } from 'react';
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
  Divider,
} from '@gluestack-ui/themed';
import { useToyRotator } from '@/context/ToyRotatorContext';
import { useScreenTracking } from '@/hooks/useAnalytics';
import { Rotation, Toy } from '@my-app/types';

export default function RotationsScreen() {
  const {
    children,
    selectedChild,
    setSelectedChild,
    toys,
    rotations,
    currentRotation,
    rotationsLoading,
    refreshRotations,
    isPaidUser,
  } = useToyRotator();
  const router = useRouter();

  useScreenTracking('Rotations');

  const onRefresh = useCallback(async () => {
    await refreshRotations();
  }, [refreshRotations]);

  // Split into current and past
  const pastRotations = useMemo(() => {
    return rotations
      .filter((r) => !r.isActive)
      .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
  }, [rotations]);

  const getToyNames = useCallback(
    (toyIds: string[]) => {
      return toyIds
        .map((id) => toys.find((t) => t.id === id)?.name)
        .filter(Boolean) as string[];
    },
    [toys]
  );

  return (
    <ScrollView
      style={{ flex: 1 }}
      refreshControl={<RefreshControl refreshing={rotationsLoading} onRefresh={onRefresh} />}
    >
      <Box p="$5" pb="$10">
        <VStack space="lg">
          {/* Header */}
          <HStack justifyContent="space-between" alignItems="center">
            <VStack>
              <Heading size="xl" color="$textLight900" $dark-color="$textDark50">
                Rotations
              </Heading>
              <Text size="sm" color="$textLight500" $dark-color="$textDark400">
                {selectedChild ? `For ${selectedChild.name}` : 'Select a child'}
              </Text>
            </VStack>
            {selectedChild && toys.length > 0 && (
              <Button
                size="md"
                onPress={() => router.push('/create-rotation' as any)}
                bg="$primary500"
                borderRadius="$full"
              >
                <HStack space="xs" alignItems="center">
                  <FontAwesome name="plus" size={14} color="#fff" />
                  <ButtonText>New</ButtonText>
                </HStack>
              </Button>
            )}
          </HStack>

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

          {/* No child selected */}
          {!selectedChild && children.length > 0 && (
            <EmptyCard
              icon="child"
              title="Select a Child"
              description="Choose a child above to see their rotations"
            />
          )}

          {/* No children at all */}
          {children.length === 0 && (
            <EmptyCard
              icon="child"
              title="Add a Child First"
              description="Go to Profile to add your first child"
              actionLabel="Go to Profile"
              onAction={() => router.push('/(tabs)/profile')}
            />
          )}

          {/* No toys */}
          {selectedChild && toys.length === 0 && (
            <EmptyCard
              icon="cube"
              title="Add Toys First"
              description="You need toys in your library before creating a rotation"
              actionLabel="Add Toy"
              onAction={() => router.push('/add-toy' as any)}
            />
          )}

          {/* Current Rotation */}
          {selectedChild && currentRotation && (
            <VStack space="sm">
              <Heading size="sm" color="$textLight700" $dark-color="$textDark300">
                Active Rotation
              </Heading>
              <RotationCard
                rotation={currentRotation}
                toyNames={getToyNames(currentRotation.toyIds)}
                isCurrent
                onPress={() => router.push(`/rotation-detail?id=${currentRotation.id}` as any)}
              />
            </VStack>
          )}

          {/* No active rotation */}
          {selectedChild && !currentRotation && !rotationsLoading && toys.length > 0 && (
            <EmptyCard
              icon="refresh"
              title="No Active Rotation"
              description={`Create a new rotation for ${selectedChild.name}`}
              actionLabel="Create Rotation"
              onAction={() => router.push('/create-rotation' as any)}
            />
          )}

          {/* Past Rotations */}
          {selectedChild && pastRotations.length > 0 && (
            <VStack space="sm" mt="$2">
              <Heading size="sm" color="$textLight700" $dark-color="$textDark300">
                Past Rotations
              </Heading>
              {pastRotations.map((rotation) => (
                <RotationCard
                  key={rotation.id}
                  rotation={rotation}
                  toyNames={getToyNames(rotation.toyIds)}
                  isCurrent={false}
                  onPress={() => router.push(`/rotation-detail?id=${rotation.id}` as any)}
                />
              ))}
            </VStack>
          )}
        </VStack>
      </Box>
    </ScrollView>
  );
}

function RotationCard({
  rotation,
  toyNames,
  isCurrent,
  onPress,
}: {
  rotation: Rotation;
  toyNames: string[];
  isCurrent: boolean;
  onPress: () => void;
}) {
  const startDate = new Date(rotation.startDate);
  const endDate = new Date(rotation.endDate);
  const now = new Date();
  const daysLeft = isCurrent
    ? Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  const formatDate = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <Pressable onPress={onPress}>
      <Box
        bg="$backgroundLight50"
        $dark-bg="$backgroundDark800"
        borderRadius="$xl"
        borderWidth={1}
        borderColor={isCurrent ? '$primary300' : '$borderLight200'}
        $dark-borderColor={isCurrent ? '$primary600' : '$borderDark700'}
        p="$4"
        opacity={isCurrent ? 1 : 0.85}
      >
        <VStack space="sm">
          <HStack justifyContent="space-between" alignItems="center">
            <HStack space="sm" alignItems="center">
              <FontAwesome
                name={rotation.source === 'ai' ? 'magic' : 'hand-paper-o'}
                size={14}
                color={rotation.source === 'ai' ? '#8b5cf6' : '#3b82f6'}
              />
              <Text size="sm" color="$textLight500" $dark-color="$textDark400">
                {formatDate(startDate)} - {formatDate(endDate)}
              </Text>
            </HStack>
            {isCurrent && (
              <Badge bg="$success100" borderRadius="$full" px="$2" py="$0.5">
                <BadgeText color="$success700" size="2xs" fontWeight="$bold">
                  {daysLeft === 0 ? 'Ends today' : `${daysLeft}d left`}
                </BadgeText>
              </Badge>
            )}
            {!isCurrent && (
              <Badge bg="$backgroundLight200" $dark-bg="$backgroundDark700" borderRadius="$full" px="$2" py="$0.5">
                <BadgeText color="$textLight500" size="2xs">
                  Ended
                </BadgeText>
              </Badge>
            )}
          </HStack>

          <Text size="md" fontWeight="$bold" color="$textLight900" $dark-color="$textDark50">
            {toyNames.length} toy{toyNames.length !== 1 ? 's' : ''}
          </Text>

          <HStack flexWrap="wrap" space="xs">
            {toyNames.slice(0, 5).map((name, i) => (
              <Box
                key={i}
                bg="$backgroundLight200"
                $dark-bg="$backgroundDark700"
                px="$2"
                py="$0.5"
                borderRadius="$full"
                mb="$1"
              >
                <Text size="2xs" color="$textLight700" $dark-color="$textDark300">
                  {name}
                </Text>
              </Box>
            ))}
            {toyNames.length > 5 && (
              <Text size="2xs" color="$textLight400" py="$0.5">
                +{toyNames.length - 5} more
              </Text>
            )}
          </HStack>

          {rotation.insightSummary && (
            <>
              <Divider />
              <HStack space="xs" alignItems="flex-start">
                <FontAwesome name="lightbulb-o" size={12} color="#f59e0b" />
                <Text size="xs" color="$textLight600" $dark-color="$textDark400" flex={1} numberOfLines={2}>
                  {rotation.insightSummary}
                </Text>
              </HStack>
            </>
          )}
        </VStack>
      </Box>
    </Pressable>
  );
}

function EmptyCard({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: React.ComponentProps<typeof FontAwesome>['name'];
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Box
      bg="$backgroundLight100"
      $dark-bg="$backgroundDark800"
      p="$6"
      borderRadius="$xl"
      alignItems="center"
    >
      <VStack space="md" alignItems="center">
        <FontAwesome name={icon} size={40} color="#94a3b8" />
        <Heading size="md" textAlign="center">
          {title}
        </Heading>
        <Text size="sm" color="$textLight500" textAlign="center">
          {description}
        </Text>
        {actionLabel && onAction && (
          <Button size="md" onPress={onAction} bg="$primary500" mt="$2">
            <ButtonText>{actionLabel}</ButtonText>
          </Button>
        )}
      </VStack>
    </Box>
  );
}
