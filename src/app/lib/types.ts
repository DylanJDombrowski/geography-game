import {
  Feature,
  FeatureCollection,
  Geometry,
  GeoJsonProperties,
} from "geojson";

// Use the standard GeoJSON types from the 'geojson' library
// This ensures compatibility with d3-geo and other mapping libraries
export interface CountryProperties {
  ADMIN: string; // Country name
  ISO_A2: string; // 2-letter country code
  ISO_A3: string; // 3-letter country code
  NAME: string; // Display name
  NAME_LONG: string; // Long form name
  POP_EST: number; // Population estimate
  CONTINENT: string; // Which continent
  SUBREGION: string; // Geographic subregion
  REGION_UN: string; // UN region classification
  REGION_WB: string; // World Bank region classification
}

// Use the standard GeoJSON Feature type with our custom properties
export interface CountryFeature extends Feature<Geometry, CountryProperties> {}

// Use the standard GeoJSON FeatureCollection type
export interface MapData
  extends FeatureCollection<Geometry, CountryProperties> {}

// Game state types remain the same - these are internal to our application
export interface GameState {
  currentQuestion: CountryFeature | null;
  score: number;
  totalQuestions: number;
  selectedCountry: CountryFeature | null;
  feedback: string;
  gameStarted: boolean;
  hoveredCountry: CountryFeature | null;
  difficulty: "easy" | "medium" | "hard";
}

// Game action types for our reducer
export type GameAction =
  | { type: "START_GAME" }
  | { type: "RESET_GAME" }
  | { type: "SET_QUESTION"; payload: CountryFeature }
  | { type: "SELECT_COUNTRY"; payload: CountryFeature }
  | { type: "SET_FEEDBACK"; payload: string }
  | { type: "INCREMENT_SCORE" }
  | { type: "SET_HOVER"; payload: CountryFeature | null }
  | { type: "SET_DIFFICULTY"; payload: "easy" | "medium" | "hard" };

// Difficulty configuration type for more structured difficulty management
export interface DifficultyConfig {
  name: string;
  description: string;
  filter: (country: CountryFeature) => boolean;
  color: string;
}

// Export for use in components that need to display difficulty information
export const DIFFICULTY_CONFIGS: Record<
  GameState["difficulty"],
  DifficultyConfig
> = {
  easy: {
    name: "Easy",
    description: "Large, well-known countries",
    filter: (country) =>
      country.properties.POP_EST > 50000000 ||
      [
        "United States of America",
        "China",
        "India",
        "Brazil",
        "Russia",
        "Canada",
        "Australia",
        "Mexico",
        "Japan",
        "Germany",
        "United Kingdom",
        "France",
        "Italy",
      ].includes(country.properties.ADMIN),
    color: "bg-green-100 text-green-800",
  },
  medium: {
    name: "Medium",
    description: "Medium-sized countries",
    filter: (country) =>
      country.properties.POP_EST > 10000000 &&
      country.properties.POP_EST <= 50000000,
    color: "bg-yellow-100 text-yellow-800",
  },
  hard: {
    name: "Hard",
    description: "All countries including small ones",
    filter: () => true, // Include all countries
    color: "bg-red-100 text-red-800",
  },
};
