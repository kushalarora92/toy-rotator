import React from 'react';
import { Image } from 'react-native';
import { VStack, Text, Heading } from '@gluestack-ui/themed';

interface AuthBrandingProps {
  /** Show the app name heading */
  showTitle?: boolean;
  /** Show the tagline text below the title */
  showTagline?: boolean;
  /** Custom title text (defaults to "My App") */
  title?: string;
  /** Custom tagline text */
  tagline?: string;
}

/**
 * Reusable branding component for auth screens.
 * Displays app logo, optional title, and optional tagline.
 * 
 * Customize by:
 * 1. Replacing the logo image at assets/images/icon.png
 * 2. Passing custom title/tagline props
 */
export function AuthBranding({
  showTitle = false,
  showTagline = false,
  title = 'My App',
  tagline = 'Welcome to your app',
}: AuthBrandingProps) {
  return (
    <VStack space="sm" alignItems="center" gap="0">
      <Image
        source={require('../assets/images/icon.png')}
        style={{ width: 150, height: 150 }}
        resizeMode="contain"
      />
      {showTitle && (
        <Heading size="2xl" style={{ marginBottom: 0 }}>
          {title}
        </Heading>
      )}
      {showTagline && (
        <Text size="sm" color="$textLight600" textAlign="center">
          {tagline}
        </Text>
      )}
    </VStack>
  );
}

export default AuthBranding;
