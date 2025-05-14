import React, { useState, useEffect, useMemo } from "react";
import { MapData } from "@/app/lib/types";
import { useGeographyGame } from "@/app/hooks/useGeographyGame";
import { filterCountriesByDifficulty } from "@/app/lib/mapUtils";
import WorldMap from "./WorldMap";
import GameControls from "./GameControls";

const GeographyGame: React.FC = () => {
  // State for loading map data
  const [mapData, setMapData] = useState<MapData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );

  // Filter countries based on difficulty level
  // useMemo ensures this only recalculates when mapData or difficulty changes
  const availableCountries = useMemo(() => {
    if (!mapData) return [];
    return filterCountriesByDifficulty(mapData.features, difficulty);
  }, [mapData, difficulty]);

  // Initialize our game logic hook with the filtered countries
  const { state, startGame, resetGame, selectCountry, setHoveredCountry } =
    useGeographyGame(availableCountries);

  // Load map data when component mounts
  useEffect(() => {
    const loadMapData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch the Natural Earth data from our public folder
        const response = await fetch("/data/ne_10m_admin_0_countries.geojson");

        if (!response.ok) {
          throw new Error(
            `Failed to load map data: ${response.status} ${response.statusText}`
          );
        }

        const data: MapData = await response.json();

        // Validate that we have the expected data structure
        if (!data.features || !Array.isArray(data.features)) {
          throw new Error("Invalid map data format");
        }

        // Filter out any countries without proper names or geometry
        const validFeatures = data.features.filter(
          (feature) =>
            feature.properties?.NAME &&
            feature.properties?.ISO_A2 &&
            feature.geometry?.type === "Polygon" &&
            Array.isArray(feature.geometry.coordinates)
        );

        setMapData({
          ...data,
          features: validFeatures,
        });

        console.log(`Loaded ${validFeatures.length} countries successfully`);
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Unknown error occurred";
        setError(errorMessage);
        console.error("Error loading map data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadMapData();
  }, []);

  // Handle difficulty change - this will reset the game if it's already started
  const handleDifficultyChange = (
    newDifficulty: "easy" | "medium" | "hard"
  ) => {
    setDifficulty(newDifficulty);
    if (state.gameStarted) {
      resetGame();
    }
  };

  // Loading state with a nice spinner
  if (loading) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading world map data...</p>
        <p className="text-sm text-gray-500 mt-2">
          This may take a moment as we load detailed country boundaries
        </p>
      </div>
    );
  }

  // Error state with helpful messaging and retry option
  if (error) {
    return (
      <div className="w-full max-w-6xl mx-auto p-6 text-center">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-red-700 mb-2">
            Unable to Load Map Data
          </h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-2 text-sm text-red-500">
            <p>
              Please make sure you have placed the Natural Earth data file at:
            </p>
            <code className="bg-red-100 px-2 py-1 rounded">
              public/data/ne_10m_admin_0_countries.json
            </code>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main game interface
  return (
    <div className="w-full max-w-7xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Game Controls Section */}
      <GameControls
        score={state.score}
        totalQuestions={state.totalQuestions}
        currentQuestion={state.currentQuestion}
        feedback={state.feedback}
        gameStarted={state.gameStarted}
        difficulty={difficulty}
        onStartGame={startGame}
        onResetGame={resetGame}
        onDifficultyChange={handleDifficultyChange}
      />

      {/* Divider */}
      <div className="my-8 border-t border-gray-200"></div>

      {/* World Map Section */}
      <div className="mt-8">
        <WorldMap
          countries={availableCountries}
          selectedCountry={state.selectedCountry}
          hoveredCountry={state.hoveredCountry}
          currentQuestion={state.currentQuestion}
          feedback={state.feedback}
          onCountryClick={selectCountry}
          onCountryHover={setHoveredCountry}
        />
      </div>

      {/* Educational Information */}
      <div className="mt-8 grid md:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-800 mb-3">
            🗺️ About This Game
          </h3>
          <div className="text-blue-700 space-y-2 text-sm">
            <p>
              This geography game uses real-world data from Natural Earth,
              ensuring accurate country shapes and borders.
            </p>
            <p>
              The map projection preserves the familiar look you&apos;d see on
              most world maps, making it easier to recognize countries.
            </p>
            <p>
              Challenge yourself by progressing through difficulty levels -
              start with large countries and work your way up to identifying
              every nation!
            </p>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-6">
          <h3 className="font-semibold text-green-800 mb-3">
            📈 Learning Tips
          </h3>
          <div className="text-green-700 space-y-2 text-sm">
            <p>
              Take note of continental contexts and neighboring countries when
              you make mistakes.
            </p>
            <p>
              Use the population hints to help narrow down your guesses - larger
              countries tend to have more people.
            </p>
            <p>
              Don&apos;t rush! Hover over countries to see their names and build
              your mental map of the world.
            </p>
            <p>
              Try playing on different difficulty levels to reinforce your
              learning of various country sizes.
            </p>
          </div>
        </div>
      </div>

      {/* Data Attribution */}
      <div className="mt-8 text-center text-xs text-gray-500 border-t pt-4">
        <p>
          Map data provided by{" "}
          <a
            href="https://www.naturalearthdata.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:text-blue-700 underline"
          >
            Natural Earth
          </a>{" "}
          • A public domain dataset perfect for educational use
        </p>
      </div>
    </div>
  );
};

export default GeographyGame;
