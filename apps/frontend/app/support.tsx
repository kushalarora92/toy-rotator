import { ScrollView, Linking } from 'react-native';
import { Box, VStack, HStack, Heading, Text, Button, ButtonText, Link } from '@gluestack-ui/themed';
import WebContainer from '@/components/WebContainer';
import FontAwesome from '@expo/vector-icons/FontAwesome';

export default function SupportScreen() {
  const SUPPORT_EMAIL = 'support@yourapp.com';

  const handleEmailPress = () => {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=Support Request`);
  };

  return (
    <WebContainer>
      <ScrollView style={{ flex: 1 }}>
        <Box flex={1} bg="$background" px="$4" py="$6">
          <VStack space="lg" maxWidth={800} alignSelf="center" width="100%">
            <VStack space="sm">
              <Heading size="2xl">Support</Heading>
              <Text size="sm" color="$textLight600">
                We're here to help
              </Text>
            </VStack>

            {/* Contact Information */}
            <VStack space="md" bg="$backgroundLight100" p="$4" borderRadius="$lg">
              <Heading size="lg">Contact Us</Heading>
              <Text>
                For any questions, issues, or feedback, please don't hesitate to reach out:
              </Text>

              <VStack space="sm" mt="$2">
                <Text fontWeight="$bold">Email Support:</Text>
                <Button
                  action="primary"
                  onPress={handleEmailPress}
                  alignSelf="flex-start"
                >
                  <ButtonText>{SUPPORT_EMAIL}</ButtonText>
                </Button>

                <Text fontWeight="$bold" mt="$3">Privacy Questions:</Text>
                <Text>privacy@yourapp.com</Text>

                <Text size="xs" color="$textLight500" mt="$2">
                  We typically respond within 24-48 hours
                </Text>
              </VStack>
            </VStack>

            {/* FAQ Section */}
            <VStack space="md">
              <Heading size="lg">Frequently Asked Questions</Heading>

              <VStack space="sm">
                <Heading size="md">Is my data secure?</Heading>
                <Text>
                  Yes! All your data is encrypted and stored securely using Firebase. Only you can 
                  access your information through your authenticated account. We do not share your 
                  data with any third parties.
                </Text>
              </VStack>

              <VStack space="sm">
                <Heading size="md">How do I delete my account?</Heading>
                <Text>
                  Go to Profile → Delete Account to request deletion. Your account will be scheduled for 
                  deletion after a 30-day grace period. During these 30 days, you can cancel the deletion 
                  by simply logging in. After 30 days, all your data will be permanently deleted.
                </Text>
              </VStack>

              <VStack space="sm">
                <Heading size="md">How do I reset my password?</Heading>
                <Text>
                  On the sign-in screen, tap "Forgot Password?" and enter your email address. 
                  You'll receive a password reset link via email.
                </Text>
              </VStack>

              <VStack space="sm">
                <Heading size="md">I'm having trouble signing in</Heading>
                <Text>
                  Make sure you're using the correct email address. If you've forgotten your password, 
                  use the "Forgot Password?" feature. If you still can't sign in, contact support.
                </Text>
              </VStack>
            </VStack>

            {/* App Information */}
            <VStack space="md" mb="$8">
              <Heading size="lg">About [App Name]</Heading>
              <Text>
                [App Name] is an application designed to help you [describe purpose].
              </Text>

              {/* Important Notice */}
              <VStack space="sm" bg="$warning100" p="$4" borderRadius="$lg" borderWidth={1} borderColor="$warning500" mt="$2">
                <HStack space="sm" alignItems="center">
                  <FontAwesome name="exclamation-triangle" size={20} color="#d97706" />
                  <Heading size="md" color="$warning700">Important Notice</Heading>
                </HStack>
                <Text size="sm" color="$warning700">
                  This app is provided as-is. The creator accepts no liability for errors or 
                  consequences. Always verify information with official sources. Use at your own risk.
                </Text>
              </VStack>

              <Text mt="$2">
                Version 1.0.0
              </Text>
              <Text mt="$2">
                <Link href="/privacy" isExternal>
                  <Text color="$primary500">Privacy Policy</Text>
                </Link>
                {'  •  '}
                <Link href="/terms" isExternal>
                  <Text color="$primary500">Terms of Service</Text>
                </Link>
              </Text>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </WebContainer>
  );
}
