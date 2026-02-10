import { useState, useEffect, useMemo } from 'react';
import { ScrollView, Platform, Alert } from 'react-native';
import { Stack, useRouter, useLocalSearchParams } from 'expo-router';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {
  Box,
  VStack,
  HStack,
  Heading,
  Text,
  Button,
  ButtonText,
  Input,
  InputField,
  FormControl,
  FormControlLabel,
  FormControlLabelText,
  FormControlError,
  FormControlErrorText,
  FormControlErrorIcon,
  AlertCircleIcon,
  Pressable,
  Textarea,
  TextareaInput,
} from '@gluestack-ui/themed';
import { useToyRotator } from '@/context/ToyRotatorContext';
import { useScreenTracking } from '@/hooks/useAnalytics';
import {
  ToyCategory,
  TOY_CATEGORIES,
  SkillTag,
  SKILL_TAGS,
  ToyStatus,
  CreateToyData,
  UpdateToyData,
} from '@my-app/types';

export default function AddToyScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { toys, addNewToy, updateExistingToy, retireToy, refreshToys } = useToyRotator();
  const router = useRouter();

  const existingToy = useMemo(() => (id ? toys.find((t) => t.id === id) : null), [id, toys]);
  const isEditing = !!existingToy;

  useScreenTracking(isEditing ? 'EditToy' : 'AddToy');

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<ToyCategory>('Other');
  const [selectedTags, setSelectedTags] = useState<SkillTag[]>([]);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Populate form if editing
  useEffect(() => {
    if (existingToy) {
      setName(existingToy.name);
      setCategory(existingToy.category);
      setSelectedTags(existingToy.skillTags || []);
      setNotes(existingToy.notes || '');
    }
  }, [existingToy]);

  const toggleTag = (tag: SkillTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setError('Please enter a toy name');
      return;
    }

    setSaving(true);
    setError('');

    try {
      if (isEditing && existingToy) {
        const updates: UpdateToyData = {
          name: name.trim(),
          category,
          skillTags: selectedTags,
          notes: notes.trim() || undefined,
        };
        await updateExistingToy(existingToy.id, updates);
      } else {
        const data: CreateToyData = {
          name: name.trim(),
          category,
          skillTags: selectedTags,
          source: 'manual',
          notes: notes.trim() || undefined,
        };
        await addNewToy(data);
      }

      const msg = isEditing ? 'Toy updated!' : 'Toy added!';
      if (Platform.OS === 'web') {
        alert(msg);
      } else {
        Alert.alert('Success', msg);
      }
      router.back();
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to save toy';
      setError(errorMsg);
    } finally {
      setSaving(false);
    }
  };

  const handleRetire = () => {
    if (!existingToy) return;

    const doRetire = async () => {
      try {
        await retireToy(existingToy.id);
        if (Platform.OS === 'web') {
          alert('Toy retired');
        } else {
          Alert.alert('Done', 'Toy retired');
        }
        router.back();
      } catch (err: any) {
        const errorMsg = err.message || 'Failed to retire toy';
        if (Platform.OS === 'web') {
          alert(errorMsg);
        } else {
          Alert.alert('Error', errorMsg);
        }
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Retire this toy? It will be hidden from future rotations.')) {
        doRetire();
      }
    } else {
      Alert.alert('Retire Toy?', 'It will be hidden from future rotations.', [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Retire', style: 'destructive', onPress: doRetire },
      ]);
    }
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: isEditing ? 'Edit Toy' : 'Add Toy',
          headerShown: true,
          presentation: 'card',
        }}
      />
      <ScrollView style={{ flex: 1 }}>
        <Box px="$6" py="$6">
          <VStack space="xl" maxWidth={500} mx="auto" width="$full">
            {/* Name */}
            <FormControl isInvalid={!!error} isRequired>
              <FormControlLabel>
                <FormControlLabelText>Toy Name</FormControlLabelText>
              </FormControlLabel>
              <Input>
                <InputField
                  placeholder="e.g. LEGO Duplo Train"
                  value={name}
                  onChangeText={(t: string) => {
                    setName(t);
                    setError('');
                  }}
                  autoFocus={!isEditing}
                  editable={!saving}
                />
              </Input>
              {error ? (
                <FormControlError>
                  <FormControlErrorIcon as={AlertCircleIcon} />
                  <FormControlErrorText>{error}</FormControlErrorText>
                </FormControlError>
              ) : null}
            </FormControl>

            {/* Category */}
            <VStack space="sm">
              <Text size="sm" fontWeight="$bold" color="$textLight700" $dark-color="$textDark300">
                Category *
              </Text>
              <HStack flexWrap="wrap" space="sm">
                {TOY_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <Pressable key={cat} onPress={() => setCategory(cat)} disabled={saving}>
                      <Box
                        px="$3"
                        py="$2"
                        borderRadius="$lg"
                        bg={isSelected ? '$primary500' : '$backgroundLight200'}
                        $dark-bg={isSelected ? '$primary600' : '$backgroundDark700'}
                        mb="$1"
                      >
                        <Text
                          size="xs"
                          fontWeight={isSelected ? '$bold' : '$normal'}
                          color={isSelected ? '$white' : '$textLight700'}
                          $dark-color={isSelected ? '$white' : '$textDark300'}
                        >
                          {cat}
                        </Text>
                      </Box>
                    </Pressable>
                  );
                })}
              </HStack>
            </VStack>

            {/* Skill Tags */}
            <VStack space="sm">
              <Text size="sm" fontWeight="$bold" color="$textLight700" $dark-color="$textDark300">
                Skill Tags (optional)
              </Text>
              <HStack flexWrap="wrap" space="sm">
                {SKILL_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <Pressable key={tag} onPress={() => toggleTag(tag)} disabled={saving}>
                      <Box
                        px="$3"
                        py="$1.5"
                        borderRadius="$full"
                        borderWidth={1}
                        borderColor={isSelected ? '$primary500' : '$borderLight300'}
                        $dark-borderColor={isSelected ? '$primary400' : '$borderDark600'}
                        bg={isSelected ? '$primary50' : 'transparent'}
                        $dark-bg={isSelected ? '$primary900' : 'transparent'}
                        mb="$1"
                      >
                        <Text
                          size="xs"
                          color={isSelected ? '$primary600' : '$textLight600'}
                          $dark-color={isSelected ? '$primary300' : '$textDark400'}
                        >
                          {tag}
                        </Text>
                      </Box>
                    </Pressable>
                  );
                })}
              </HStack>
            </VStack>

            {/* Notes */}
            <FormControl>
              <FormControlLabel>
                <FormControlLabelText>Notes (optional)</FormControlLabelText>
              </FormControlLabel>
              <Textarea>
                <TextareaInput
                  placeholder="Any notes about this toy..."
                  value={notes}
                  onChangeText={setNotes}
                  editable={!saving}
                />
              </Textarea>
            </FormControl>

            {/* Save Button */}
            <Button
              size="lg"
              onPress={handleSave}
              isDisabled={saving || !name.trim()}
              bg="$primary500"
              $dark-bg="$primary600"
            >
              <ButtonText>
                {saving ? 'Saving...' : isEditing ? 'Update Toy' : 'Add Toy'}
              </ButtonText>
            </Button>

            {/* Retire button (edit only) */}
            {isEditing && existingToy?.status !== 'retired' && (
              <Button
                size="md"
                variant="outline"
                action="negative"
                onPress={handleRetire}
                isDisabled={saving}
              >
                <ButtonText>Retire Toy</ButtonText>
              </Button>
            )}
          </VStack>
        </Box>
      </ScrollView>
    </>
  );
}
