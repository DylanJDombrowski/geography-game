import { useReducer, useCallback } from "react";
import { GameState, GameAction, CountryFeature } from "@/app/lib/types";

// Initial game state
const initialState: GameState = {
  currentQuestion: null,
  score: 0,
  totalQuestions: 0,
  selectedCountry: null,
  feedback: "",
  gameStarted: false,
  hoveredCountry: null,
  difficulty: "easy",
};

// Game state reducer - this manages all state changes in one place
function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "START_GAME":
      return {
        ...state,
        gameStarted: true,
        score: 0,
        totalQuestions: 0,
        selectedCountry: null,
        feedback: "",
      };

    case "RESET_GAME":
      return initialState;

    case "SET_QUESTION":
      return {
        ...state,
        currentQuestion: action.payload,
        selectedCountry: null,
        feedback: "",
        totalQuestions: state.totalQuestions + 1,
      };

    case "SELECT_COUNTRY":
      return {
        ...state,
        selectedCountry: action.payload,
      };

    case "SET_FEEDBACK":
      return {
        ...state,
        feedback: action.payload,
      };

    case "INCREMENT_SCORE":
      return {
        ...state,
        score: state.score + 1,
      };

    case "SET_HOVER":
      return {
        ...state,
        hoveredCountry: action.payload,
      };

    default:
      return state;
  }
}

// Custom hook that encapsulates all game logic
export const useGeographyGame = (countries: CountryFeature[]) => {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  // Generate a new question by selecting a random country
  const generateQuestion = useCallback(() => {
    if (countries.length === 0) return;

    const randomIndex = Math.floor(Math.random() * countries.length);
    const selectedCountry = countries[randomIndex];
    dispatch({ type: "SET_QUESTION", payload: selectedCountry });
  }, [countries]);

  // Handle country selection
  const selectCountry = useCallback(
    (country: CountryFeature) => {
      if (!state.currentQuestion) return;

      dispatch({ type: "SELECT_COUNTRY", payload: country });

      // Check if the answer is correct
      if (
        country.properties.ISO_A2 === state.currentQuestion.properties.ISO_A2
      ) {
        dispatch({ type: "INCREMENT_SCORE" });
        dispatch({ type: "SET_FEEDBACK", payload: `Correct! Well done! 🎉` });
      } else {
        dispatch({
          type: "SET_FEEDBACK",
          payload: `Incorrect. You selected ${country.properties.NAME}, but the answer was ${state.currentQuestion.properties.NAME}.`,
        });
      }

      // Generate next question after 2.5 seconds
      setTimeout(() => {
        generateQuestion();
      }, 2500);
    },
    [state.currentQuestion, generateQuestion]
  );

  // Start the game
  const startGame = useCallback(() => {
    dispatch({ type: "START_GAME" });
    generateQuestion();
  }, [generateQuestion]);

  // Reset the game
  const resetGame = useCallback(() => {
    dispatch({ type: "RESET_GAME" });
  }, []);

  // Set hovered country (for UI feedback)
  const setHoveredCountry = useCallback((country: CountryFeature | null) => {
    dispatch({ type: "SET_HOVER", payload: country });
  }, []);

  return {
    state,
    startGame,
    resetGame,
    selectCountry,
    setHoveredCountry,
    generateQuestion,
  };
};
