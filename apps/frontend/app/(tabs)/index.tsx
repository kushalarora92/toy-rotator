import { ScrollView } from 'react-native';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Divider,
} from '@gluestack-ui/themed';
import { useAuth } from '@/context/AuthContext';
import { useScreenTracking } from '@/hooks/useAnalytics';

export default function DashboardScreen() {
  const { user, userProfile, profileLoading } = useAuth();

  // Track screen view
  useScreenTracking('Dashboard');

  // Get display name or fallback to email
  const displayName = userProfile?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <ScrollView style={{ flex: 1 }}>
      <Box p="$5">
        <VStack space="lg">
          {/* Welcome Header */}
          <VStack space="xs">
            <Heading size="2xl">
              Welcome, {profileLoading ? '...' : displayName}!
            </Heading>
            <Text size="md" color="$textLight500">
              Here's your dashboard overview
            </Text>
          </VStack>

          {!user?.emailVerified && (
            <HStack
              space="sm"
              bg="$warning100"
              p="$3"
              borderRadius="$lg"
              alignItems="center"
            >
              <FontAwesome name="exclamation-triangle" size={16} color="#92400e" />
              <Text size="sm" color="$warning700" flex={1}>
                Please verify your email to access all features
              </Text>
            </HStack>
          )}

          <Divider />

          {/* Placeholder Content */}
          <Box
            bg="$backgroundLight100"
            p="$6"
            borderRadius="$xl"
            alignItems="center"
            sx={{
              _dark: {
                bg: '$backgroundDark800',
              },
            }}
          >
            <VStack space="md" alignItems="center">
              <FontAwesome name="rocket" size={48} color="#94a3b8" />
              <Heading size="lg" textAlign="center">
                Your Dashboard
              </Heading>
              <Text size="sm" color="$textLight500" textAlign="center">
                This is your main dashboard. Customize this screen to show
                the most important information for your app.
              </Text>
            </VStack>
          </Box>
        </VStack>
      </Box>
    </ScrollView>
  );
}
