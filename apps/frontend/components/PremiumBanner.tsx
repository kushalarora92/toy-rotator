import React from 'react';
import { Box, HStack, VStack, Text, Button, ButtonText } from '@gluestack-ui/themed';
import { useRouter } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface PremiumBannerProps {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Button label */
  buttonLabel?: string;
  /** Compact mode — smaller banner */
  compact?: boolean;
}

/**
 * Reusable banner to upsell premium subscription.
 * Navigates to the paywall screen on tap.
 */
export function PremiumBanner({
  title = 'Upgrade to Premium',
  description = 'Unlock AI-powered features and unlimited access',
  buttonLabel = 'Learn More',
  compact = false,
}: PremiumBannerProps) {
  const router = useRouter();

  if (compact) {
    return (
      <Button
        bg="$amber600"
        borderRadius="$lg"
        onPress={() => router.push('/paywall' as any)}
      >
        <HStack space="sm" alignItems="center">
          <FontAwesome name="star" size={14} color="#fff" />
          <ButtonText fontSize="$sm" fontWeight="$bold">
            {buttonLabel}
          </ButtonText>
        </HStack>
      </Button>
    );
  }

  return (
    <Box
      bg="$amber600"
      borderRadius="$xl"
      p="$4"
      mx="$1"
    >
      <HStack space="md" alignItems="center">
        <Box
          bg="$amber500"
          p="$2"
          borderRadius="$full"
        >
          <FontAwesome name="star" size={20} color="#fff" />
        </Box>
        <VStack flex={1} space="xs">
          <Text color="$white" fontWeight="$bold" fontSize="$md">
            {title}
          </Text>
          <Text color="$amber100" fontSize="$xs">
            {description}
          </Text>
        </VStack>
        <Button
          size="sm"
          bg="$white"
          borderRadius="$lg"
          onPress={() => router.push('/paywall' as any)}
        >
          <ButtonText color="$amber700" fontWeight="$bold" fontSize="$xs">
            {buttonLabel}
          </ButtonText>
        </Button>
      </HStack>
    </Box>
  );
}

export default PremiumBanner;
