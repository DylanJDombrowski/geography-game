import {
  CountryFeature,
  GameState,
  DifficultyConfig,
  DIFFICULTY_CONFIGS,
} from "./types";

/**
 * Game Logic Functions
 *
 * This file contains pure functions that implement the core game rules.
 * These functions don't depend on React state or UI components - they just
 * take inputs and return outputs based on game rules.
 */

// Generate a random question from available countries
export const generateRandomQuestion = (
  countries: CountryFeature[]
): CountryFeature | null => {
  if (countries.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * countries.length);
  return countries[randomIndex];
};

// Check if a player's answer is correct
export const checkAnswer = (
  selectedCountry: CountryFeature,
  correctAnswer: CountryFeature
): boolean => {
  return selectedCountry.properties.ISO_A2 === correctAnswer.properties.ISO_A2;
};

// Calculate accuracy percentage
export const calculateAccuracy = (
  score: number,
  totalQuestions: number
): number => {
  if (totalQuestions === 0) return 0;
  return Math.round((score / totalQuestions) * 100);
};

// Generate feedback message based on the answer
export const generateFeedback = (
  isCorrect: boolean,
  selectedCountry: CountryFeature,
  correctAnswer: CountryFeature
): string => {
  if (isCorrect) {
    const encouragements = [
      "Excellent! 🌍",
      "Well done! 🎉",
      "Perfect! 🎯",
      "Outstanding! ⭐",
      "Brilliant! 🌟",
    ];
    return encouragements[Math.floor(Math.random() * encouragements.length)];
  } else {
    return `Incorrect. You selected ${selectedCountry.properties.NAME}, but the answer was ${correctAnswer.properties.NAME}.`;
  }
};

// Filter countries based on difficulty with more sophisticated rules
export const filterCountriesByDifficulty = (
  countries: CountryFeature[],
  difficulty: keyof typeof DIFFICULTY_CONFIGS
): CountryFeature[] => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return countries.filter(config.filter);
};

// Get countries by continent for regional challenges
export const filterCountriesByContinent = (
  countries: CountryFeature[],
  continent: string
): CountryFeature[] => {
  return countries.filter(
    (country) =>
      country.properties.CONTINENT.toLowerCase() === continent.toLowerCase()
  );
};

// Get countries by region for more specific challenges
export const filterCountriesByRegion = (
  countries: CountryFeature[],
  region: string
): CountryFeature[] => {
  return countries.filter(
    (country) =>
      country.properties.SUBREGION?.toLowerCase().includes(
        region.toLowerCase()
      ) ||
      country.properties.REGION_UN?.toLowerCase().includes(region.toLowerCase())
  );
};

// Find similar countries based on population (for creating challenging questions)
export const findSimilarCountries = (
  targetCountry: CountryFeature,
  allCountries: CountryFeature[],
  tolerance: number = 0.5 // Population difference tolerance (50% by default)
): CountryFeature[] => {
  const targetPop = targetCountry.properties.POP_EST;
  const minPop = targetPop * (1 - tolerance);
  const maxPop = targetPop * (1 + tolerance);

  return allCountries.filter(
    (country) =>
      country.properties.ISO_A2 !== targetCountry.properties.ISO_A2 &&
      country.properties.POP_EST >= minPop &&
      country.properties.POP_EST <= maxPop
  );
};

// Create a quiz progression that gets harder as player improves
export const createAdaptiveDifficulty = (
  score: number,
  totalQuestions: number,
  currentDifficulty: keyof typeof DIFFICULTY_CONFIGS
): keyof typeof DIFFICULTY_CONFIGS => {
  const accuracy = calculateAccuracy(score, totalQuestions);

  // Only adjust after at least 5 questions
  if (totalQuestions < 5) return currentDifficulty;

  // If accuracy is above 80%, increase difficulty
  if (accuracy >= 80) {
    if (currentDifficulty === "easy") return "medium";
    if (currentDifficulty === "medium") return "hard";
  }

  // If accuracy is below 50%, decrease difficulty
  if (accuracy < 50) {
    if (currentDifficulty === "hard") return "medium";
    if (currentDifficulty === "medium") return "easy";
  }

  return currentDifficulty;
};

// Validate game state for debugging and error prevention
export const validateGameState = (state: GameState): string[] => {
  const errors: string[] = [];

  if (state.score < 0) {
    errors.push("Score cannot be negative");
  }

  if (state.totalQuestions < 0) {
    errors.push("Total questions cannot be negative");
  }

  if (state.score > state.totalQuestions) {
    errors.push("Score cannot exceed total questions");
  }

  if (state.gameStarted && !state.currentQuestion) {
    errors.push("Game started but no current question");
  }

  return errors;
};

// Export game constants that components might need
export const GAME_CONSTANTS = {
  MIN_QUESTIONS_FOR_STATS: 5,
  FEEDBACK_DISPLAY_DURATION: 2500, // milliseconds
  MAX_QUESTIONS_PER_SESSION: 50,
  COUNTRIES_PER_DIFFICULTY: {
    easy: "Large countries (50M+ population)",
    medium: "Medium countries (10-50M population)",
    hard: "All countries",
  },
} as const;
