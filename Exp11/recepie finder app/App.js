import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  ScrollView,
  Alert,
  SafeAreaView
} from 'react-native';

export default function App() {
  const [searchText, setSearchText] = useState('');
  const [recipeData, setRecipeData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Helper: parse ingredients/measures from TheMealDB response object
  const extractIngredients = (mealObj) => {
    const items = [];
    for (let i = 1; i <= 20; i++) {
      const ing = mealObj[`strIngredient${i}`];
      const measure = mealObj[`strMeasure${i}`];
      if (ing && ing.trim()) {
        items.push(`${measure ? measure.trim() + ' ' : ''}${ing.trim()}`);
      }
    }
    return items;
  };

  const searchRecipe = async () => {
    if (!searchText.trim()) {
      Alert.alert('Search Required', 'Please enter a recipe name or keyword.');
      return;
    }

    setIsLoading(true);
    setRecipeData(null);

    const query = encodeURIComponent(searchText.trim());
    // TheMealDB free search endpoint (no API key required)
    const apiUrl = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        Alert.alert('API Error', `An error occurred: Status ${response.status}`);
        return;
      }

      const data = await response.json();

      if (!data.meals) {
        Alert.alert('Not Found', `No recipes found for "${searchText}". Try another keyword.`);
        return;
      }

      // We'll just take the first match for simplicity
      const meal = data.meals[0];

      const extracted = {
        id: meal.idMeal,
        name: meal.strMeal,
        category: meal.strCategory,
        area: meal.strArea,
        imageUrl: meal.strMealThumb,
        instructions: meal.strInstructions,
        youtube: meal.strYoutube,
        ingredients: extractIngredients(meal),
      };

      setRecipeData(extracted);
    } catch (err) {
      console.error('Fetch error:', err);
      Alert.alert('Network Error', 'A network error occurred. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRecipeCard = () => {
    if (!recipeData) return null;

    return (
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
          {recipeData.name}
        </Text>
        <Text style={styles.cardSubtitle}>
          {recipeData.category} {recipeData.area ? `• ${recipeData.area}` : ''}
        </Text>

        <Image
          style={styles.recipeImage}
          source={{ uri: recipeData.imageUrl }}
          resizeMode="cover"
        />

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ingredients</Text>
          {recipeData.ingredients.map((ing, idx) => (
            <Text key={idx} style={styles.ingredientText}>• {ing}</Text>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Instructions</Text>
          <Text style={styles.instructionText}>{recipeData.instructions}</Text>
        </View>

        {recipeData.youtube ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Video</Text>
            <Text style={styles.linkText}>{recipeData.youtube}</Text>
          </View>
        ) : null}
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Recipe Finder</Text>

        <View style={styles.searchBarContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Enter recipe name or ingredient (e.g., 'chicken')"
            placeholderTextColor="#6B7280"
            value={searchText}
            onChangeText={setSearchText}
            onSubmitEditing={searchRecipe}
            returnKeyType="search"
          />
          <TouchableOpacity
            style={styles.searchButton}
            onPress={searchRecipe}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.searchButtonText}>Search</Text>
            )}
          </TouchableOpacity>
        </View>

        {!isLoading && renderRecipeCard()}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF7ED',
  },
  container: {
    marginTop: 20,
    alignItems: 'center',
    padding: 20,
    minHeight: '100%',
  },
  header: {
    fontSize: 32,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 20,
  },
  searchBarContainer: {
    flexDirection: 'row',
    width: '100%',
    maxWidth: 600,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    elevation: 6,
    marginBottom: 20,
  },
  searchInput: {
    flex: 1,
    height: 50,
    paddingHorizontal: 15,
    fontSize: 16,
    color: '#1F2937',
  },
  searchButton: {
    backgroundColor: '#10B981',
    paddingHorizontal: 20,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  searchButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 16,
  },
  card: {
    width: '100%',
    maxWidth: 760,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 18,
    marginTop: 10,
    elevation: 6,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#111827',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 12,
  },
  recipeImage: {
    width: '100%',
    height: 220,
    borderRadius: 8,
    marginBottom: 12,
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  ingredientText: {
    fontSize: 14,
    marginBottom: 4,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#374151',
  },
  linkText: {
    fontSize: 14,
    color: '#2563EB',
  },
});
