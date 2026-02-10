import { ScrollView } from 'react-native';
import { Box, VStack, Heading, Text, Link } from '@gluestack-ui/themed';
import WebContainer from '@/components/WebContainer';

export default function PrivacyPolicyScreen() {
  return (
    <WebContainer>
      <ScrollView style={{ flex: 1 }}>
        <Box flex={1} bg="$background" px="$4" py="$6">
          <VStack space="lg" maxWidth={800} alignSelf="center" width="100%">
            <VStack space="sm">
              <Heading size="2xl">Privacy Policy</Heading>
              <Text size="sm" color="$textLight600">Last Updated: [DATE]</Text>
              <Text size="sm" color="$textLight600">Version: 1.0.0</Text>
            </VStack>

            {/* Introduction */}
            <VStack space="sm">
              <Heading size="lg">Introduction</Heading>
              <Text>
                [App Name] ("we", "our", or "the app") is committed to protecting your privacy. 
                This Privacy Policy explains how we collect, use, and safeguard your personal information 
                when you use our application.
              </Text>
            </VStack>

            {/* Information We Collect */}
            <VStack space="sm">
              <Heading size="lg">Information We Collect</Heading>

              <Heading size="md">Personal Information You Provide</Heading>
              <Text>When you use [App Name], you may provide:</Text>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Account Information:</Text> Email address, display name</Text>
                <Text>• <Text fontWeight="$bold">Profile Data:</Text> Information you enter into your profile</Text>
              </VStack>

              <Heading size="md" mt="$2">Automatically Collected Information</Heading>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Usage Data:</Text> App features used, screens viewed, session duration</Text>
                <Text>• <Text fontWeight="$bold">Device Information:</Text> Device type, operating system, app version</Text>
                <Text>• <Text fontWeight="$bold">Analytics Data:</Text> Anonymous usage patterns to improve the app</Text>
              </VStack>
            </VStack>

            {/* How We Use Your Information */}
            <VStack space="sm">
              <Heading size="lg">How We Use Your Information</Heading>
              <Text>We use your information to:</Text>

              <Heading size="md">1. Provide Core Services</Heading>
              <VStack space="xs" ml="$4">
                <Text>• Deliver the app's features and functionality</Text>
                <Text>• Store and manage your profile data</Text>
                <Text>• Personalize your experience</Text>
              </VStack>

              <Heading size="md" mt="$2">2. Improve the App</Heading>
              <VStack space="xs" ml="$4">
                <Text>• Analyze usage patterns</Text>
                <Text>• Fix bugs and improve performance</Text>
                <Text>• Develop new features</Text>
              </VStack>

              <Heading size="md" mt="$2">3. Communicate with You</Heading>
              <VStack space="xs" ml="$4">
                <Text>• Send important updates about the app</Text>
                <Text>• Respond to support requests</Text>
                <Text>• Provide service-related notifications</Text>
              </VStack>
            </VStack>

            {/* Data Storage and Security */}
            <VStack space="sm">
              <Heading size="lg">Data Storage and Security</Heading>

              <Heading size="md">Where Your Data is Stored</Heading>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Firebase Firestore:</Text> All personal data is stored securely on Google Cloud Platform servers</Text>
                <Text>• <Text fontWeight="$bold">Encryption:</Text> Data is encrypted both in transit (HTTPS) and at rest</Text>
              </VStack>

              <Heading size="md" mt="$2">Security Measures</Heading>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Authentication:</Text> Firebase Authentication with email/password</Text>
                <Text>• <Text fontWeight="$bold">Access Control:</Text> Only you can access your data through authenticated sessions</Text>
                <Text>• <Text fontWeight="$bold">Firestore Security Rules:</Text> Database-level security prevents unauthorized access</Text>
                <Text>• <Text fontWeight="$bold">No Third-Party Access:</Text> We do not share your data with third parties</Text>
              </VStack>

              <Heading size="md" mt="$2">Data Retention</Heading>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Active Accounts:</Text> Data retained as long as your account is active</Text>
                <Text>• <Text fontWeight="$bold">Account Deletion:</Text> You can request account deletion at any time from your Profile settings</Text>
                <Text>• <Text fontWeight="$bold">30-Day Grace Period:</Text> When you request deletion, your account is scheduled for deletion after 30 days. During this period, you can cancel the deletion by logging in</Text>
                <Text>• <Text fontWeight="$bold">Permanent Deletion:</Text> After 30 days, all your data is permanently deleted from our systems</Text>
              </VStack>
            </VStack>

            {/* Your Rights */}
            <VStack space="sm">
              <Heading size="lg">Your Rights</Heading>
              <Text>You have the right to:</Text>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Access:</Text> View all data we have about you through the app</Text>
                <Text>• <Text fontWeight="$bold">Correction:</Text> Update or correct your information in your profile</Text>
                <Text>• <Text fontWeight="$bold">Deletion:</Text> Request deletion of your account and data from Profile settings</Text>
                <Text>• <Text fontWeight="$bold">Export:</Text> Request a copy of your data (contact support)</Text>
              </VStack>
            </VStack>

            {/* Third-Party Services */}
            <VStack space="sm">
              <Heading size="lg">Third-Party Services</Heading>
              <Text>We use the following third-party services:</Text>

              <Heading size="md">Firebase (Google)</Heading>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Purpose:</Text> Authentication, database, analytics, hosting</Text>
                <Text>• <Text fontWeight="$bold">Data Collected:</Text> Email, user ID, usage data</Text>
                <Text>• <Text fontWeight="$bold">Privacy Policy:</Text> <Link href="https://firebase.google.com/support/privacy" isExternal>
                  <Text color="$primary500">https://firebase.google.com/support/privacy</Text>
                </Link></Text>
              </VStack>

              <Heading size="md" mt="$2">Expo</Heading>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Purpose:</Text> App development platform</Text>
                <Text>• <Text fontWeight="$bold">Data Collected:</Text> Crash reports, performance metrics</Text>
                <Text>• <Text fontWeight="$bold">Privacy Policy:</Text> <Link href="https://expo.dev/privacy" isExternal>
                  <Text color="$primary500">https://expo.dev/privacy</Text>
                </Link></Text>
              </VStack>
            </VStack>

            {/* Children's Privacy */}
            <VStack space="sm">
              <Heading size="lg">Children's Privacy</Heading>
              <Text>
                [App Name] is not intended for users under 18 years of age. We do not knowingly 
                collect information from children. If you believe a child has provided us with personal 
                information, please contact us immediately.
              </Text>
            </VStack>

            {/* Analytics */}
            <VStack space="sm">
              <Heading size="lg">Analytics</Heading>
              <Text>We use Firebase Analytics to understand how users interact with the app:</Text>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Data Collected:</Text> Screen views, button clicks, feature usage</Text>
                <Text>• <Text fontWeight="$bold">Purpose:</Text> Improve user experience, fix issues, and understand usage patterns</Text>
                <Text>• <Text fontWeight="$bold">Anonymous:</Text> Analytics data is aggregated and not linked to your personal information</Text>
              </VStack>
            </VStack>

            {/* Cookies and Tracking */}
            <VStack space="sm">
              <Heading size="lg">Cookies and Tracking</Heading>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Web Version:</Text> Uses browser local storage for authentication persistence</Text>
                <Text>• <Text fontWeight="$bold">Mobile Apps:</Text> Uses secure device storage for session management</Text>
                <Text>• <Text fontWeight="$bold">No Advertising Cookies:</Text> We do not use advertising or tracking cookies</Text>
              </VStack>
            </VStack>

            {/* Changes to This Policy */}
            <VStack space="sm">
              <Heading size="lg">Changes to This Policy</Heading>
              <Text>We may update this Privacy Policy from time to time. We will notify you of significant changes by:</Text>
              <VStack space="xs" ml="$4">
                <Text>• Updating the "Last Updated" date</Text>
                <Text>• Displaying an in-app notice</Text>
                <Text>• Sending an email notification (for major changes)</Text>
              </VStack>
            </VStack>

            {/* Contact Us */}
            <VStack space="sm">
              <Heading size="lg">Contact Us</Heading>
              <Text>For privacy-related questions or requests:</Text>
              <VStack space="xs" ml="$4">
                <Text>• <Text fontWeight="$bold">Email:</Text> privacy@yourapp.com</Text>
                <Text>• <Text fontWeight="$bold">Support:</Text> support@yourapp.com</Text>
              </VStack>
            </VStack>

            {/* Important Notice */}
            <VStack space="sm" bg="$warning100" p="$4" borderRadius="$lg" borderWidth={1} borderColor="$warning500">
              <Heading size="lg" color="$warning700">Important Notice</Heading>
              <Text fontWeight="$bold" color="$warning700">
                [App Name] is provided as-is.
              </Text>
              <VStack space="xs" ml="$4" mt="$2">
                <Text>• <Text fontWeight="$bold">No Liability:</Text> The creator accepts no liability for any errors, omissions, or consequences arising from the use of this app.</Text>
                <Text>• <Text fontWeight="$bold">No Warranties:</Text> This app is provided "as is" without warranties of any kind, express or implied.</Text>
                <Text>• <Text fontWeight="$bold">Always Verify:</Text> Always check official sources for the most accurate information.</Text>
              </VStack>
            </VStack>

            {/* Consent */}
            <VStack space="sm" mb="$8">
              <Heading size="lg">Consent</Heading>
              <Text>
                By using [App Name], you acknowledge that you have read and understood this Privacy Policy 
                and you consent to our collection and use of information as described.
              </Text>
            </VStack>
          </VStack>
        </Box>
      </ScrollView>
    </WebContainer>
  );
}
