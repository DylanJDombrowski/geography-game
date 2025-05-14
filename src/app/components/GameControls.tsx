import React from "react";
import { CountryFeature } from "@/app/lib/types";

interface GameControlsProps {
  score: number;
  totalQuestions: number;
  currentQuestion: CountryFeature | null;
  feedback: string;
  gameStarted: boolean;
  difficulty: "easy" | "medium" | "hard";
  onStartGame: () => void;
  onResetGame: () => void;
  onDifficultyChange: (difficulty: "easy" | "medium" | "hard") => void;
}

const GameControls: React.FC<GameControlsProps> = ({
  score,
  totalQuestions,
  currentQuestion,
  feedback,
  gameStarted,
  difficulty,
  onStartGame,
  onResetGame,
  onDifficultyChange,
}) => {
  // Calculate accuracy percentage
  const accuracy =
    totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  // Get difficulty description for better UX
  const getDifficultyDescription = (diff: string) => {
    switch (diff) {
      case "easy":
        return "Large, well-known countries";
      case "medium":
        return "Medium-sized countries";
      case "hard":
        return "All countries including small ones";
      default:
        return "";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          🌍 Geography Challenge
        </h1>
        <p className="text-gray-600">
          Test your knowledge of world geography by clicking on countries!
        </p>
      </div>

      {/* Score Display */}
      <div className="text-center">
        <div className="inline-flex items-center space-x-6 bg-blue-50 px-6 py-3 rounded-lg">
          <div className="text-lg font-semibold text-blue-700">
            Score: {score} / {totalQuestions}
          </div>
          {totalQuestions > 0 && (
            <div className="text-gray-600">{accuracy}% Accuracy</div>
          )}
          <div className="text-sm text-gray-500 capitalize">
            {difficulty} Mode
          </div>
        </div>
      </div>

      {/* Difficulty Selector */}
      {!gameStarted && (
        <div className="text-center">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Choose Difficulty:
          </label>
          <div className="flex justify-center space-x-4">
            {(["easy", "medium", "hard"] as const).map((diff) => (
              <button
                key={diff}
                onClick={() => onDifficultyChange(diff)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  difficulty === diff
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                }`}
              >
                <div className="capitalize">{diff}</div>
                <div className="text-xs mt-1 opacity-75">
                  {getDifficultyDescription(diff)}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Game Controls */}
      <div className="text-center">
        {!gameStarted ? (
          <button
            onClick={onStartGame}
            className="px-8 py-4 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-colors text-lg shadow-md"
          >
            🚀 Start Geography Challenge
          </button>
        ) : (
          <div className="space-y-4">
            <button
              onClick={onResetGame}
              className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Reset Game
            </button>
          </div>
        )}
      </div>

      {/* Current Question */}
      {currentQuestion && (
        <div className="text-center bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">
            Find:{" "}
            <span className="text-blue-600">
              {currentQuestion.properties.NAME}
            </span>
          </h2>
          <div className="text-sm text-gray-600 space-y-1">
            <p>Continent: {currentQuestion.properties.CONTINENT}</p>
            <p>
              Population: ~
              {(currentQuestion.properties.POP_EST / 1000000).toFixed(1)}M
              people
            </p>
            {currentQuestion.properties.SUBREGION && (
              <p>Region: {currentQuestion.properties.SUBREGION}</p>
            )}
          </div>
        </div>
      )}

      {/* Feedback */}
      {feedback && (
        <div className="text-center">
          <div
            className={`inline-block px-6 py-3 rounded-lg font-semibold text-lg ${
              feedback.includes("Correct")
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            {feedback}
          </div>
        </div>
      )}

      {/* Instructions */}
      {!gameStarted && (
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold text-gray-800 mb-3">How to Play:</h3>
          <div className="text-gray-600 space-y-2 text-sm">
            <p>
              🎯 Select your difficulty level to determine which countries
              you'll be asked about
            </p>
            <p>
              📍 When the game starts, you'll see a country name and some
              helpful information
            </p>
            <p>🔍 Hover over countries on the map to see their names</p>
            <p>✅ Click on the correct country to score points</p>
            <p>📊 Track your accuracy percentage as you play</p>
            <p>🌟 Try to achieve 100% accuracy on all difficulty levels!</p>
          </div>
        </div>
      )}

      {/* Game Statistics */}
      {gameStarted && totalQuestions > 0 && (
        <div className="bg-gray-50 rounded-lg p-4">
          <h3 className="font-semibold text-gray-800 mb-3">Game Statistics:</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Questions Answered:</span>
              <span className="font-semibold ml-2">{totalQuestions}</span>
            </div>
            <div>
              <span className="text-gray-600">Correct Answers:</span>
              <span className="font-semibold ml-2">{score}</span>
            </div>
            <div>
              <span className="text-gray-600">Accuracy:</span>
              <span className="font-semibold ml-2">{accuracy}%</span>
            </div>
            <div>
              <span className="text-gray-600">Difficulty:</span>
              <span className="font-semibold ml-2 capitalize">
                {difficulty}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GameControls;
