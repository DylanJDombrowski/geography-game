import React from "react";
import { CountryFeature } from "@/app/lib/types";
import { createProjection, featureToPath } from "@/app/lib/mapUtils";

interface WorldMapProps {
  countries: CountryFeature[];
  selectedCountry: CountryFeature | null;
  hoveredCountry: CountryFeature | null;
  currentQuestion: CountryFeature | null;
  feedback: string;
  onCountryClick: (country: CountryFeature) => void;
  onCountryHover: (country: CountryFeature | null) => void;
}

const WorldMap: React.FC<WorldMapProps> = ({
  countries,
  selectedCountry,
  hoveredCountry,
  currentQuestion,
  feedback,
  onCountryClick,
  onCountryHover,
}) => {
  // Set up our map dimensions
  const mapWidth = 1000;
  const mapHeight = 600;

  // Create a Mercator projection for our map
  // This converts latitude/longitude coordinates to screen pixels
  const projection = createProjection(mapWidth, mapHeight);

  // Function to determine the color of each country based on game state
  const getCountryColor = (country: CountryFeature): string => {
    // If this country was just selected, show feedback colors
    if (selectedCountry?.properties.ISO_A2 === country.properties.ISO_A2) {
      return feedback.includes("Correct") ? "#4caf50" : "#f44336";
    }

    // If hovering over this country, highlight it
    if (hoveredCountry?.properties.ISO_A2 === country.properties.ISO_A2) {
      return "#e3f2fd";
    }

    // If this is the current question and user made a wrong guess, keep it highlighted
    if (
      currentQuestion?.properties.ISO_A2 === country.properties.ISO_A2 &&
      selectedCountry &&
      !feedback.includes("Correct")
    ) {
      return "#ffeb3b"; // Yellow to show the correct answer
    }

    // Default country color
    return "#f5f5f5";
  };

  // Function to get the stroke (border) color
  const getStrokeColor = (country: CountryFeature): string => {
    if (
      currentQuestion?.properties.ISO_A2 === country.properties.ISO_A2 &&
      selectedCountry &&
      !feedback.includes("Correct")
    ) {
      return "#ff9800"; // Orange border for correct answer highlight
    }
    return "#ffffff";
  };

  return (
    <div className="border-2 border-gray-200 rounded-lg overflow-hidden bg-gradient-to-b from-sky-100 to-blue-50">
      <svg
        viewBox={`0 0 ${mapWidth} ${mapHeight}`}
        className="w-full h-auto"
        style={{ minHeight: "400px" }}
      >
        {/* Ocean background */}
        <rect width={mapWidth} height={mapHeight} fill="#e6f3ff" />

        {/* Render each country */}
        {countries.map((country) => {
          // Convert the country's geographic coordinates to an SVG path
          const pathData = featureToPath(country, projection);

          // Skip countries that don't have valid path data
          if (!pathData) return null;

          return (
            <path
              key={country.properties.ISO_A2}
              d={pathData}
              fill={getCountryColor(country)}
              stroke={getStrokeColor(country)}
              strokeWidth="1"
              className="cursor-pointer transition-all duration-300 hover:brightness-110"
              onClick={() => onCountryClick(country)}
              onMouseEnter={() => onCountryHover(country)}
              onMouseLeave={() => onCountryHover(null)}
            />
          );
        })}

        {/* Country label - show hovered country name */}
        {hoveredCountry && (
          <g>
            {/* Background rectangle for better text readability */}
            <rect
              x="20"
              y="20"
              width={hoveredCountry.properties.NAME.length * 8 + 20}
              height="30"
              fill="rgba(255, 255, 255, 0.9)"
              stroke="#ccc"
              strokeWidth="1"
              rx="4"
            />
            <text x="30" y="40" className="text-sm font-semibold fill-gray-700">
              {hoveredCountry.properties.NAME}
            </text>
          </g>
        )}

        {/* Legend */}
        <g transform="translate(20, 520)">
          <rect
            width="200"
            height="60"
            fill="rgba(255, 255, 255, 0.9)"
            stroke="#ccc"
            strokeWidth="1"
            rx="4"
          />
          <text x="10" y="20" className="text-xs font-semibold fill-gray-700">
            Legend:
          </text>
          <circle cx="20" cy="35" r="5" fill="#e3f2fd" />
          <text x="35" y="40" className="text-xs fill-gray-600">
            Hovered
          </text>
          <circle cx="20" cy="50" r="5" fill="#4caf50" />
          <text x="35" y="55" className="text-xs fill-gray-600">
            Correct
          </text>
          <circle cx="100" cy="35" r="5" fill="#f44336" />
          <text x="115" y="40" className="text-xs fill-gray-600">
            Incorrect
          </text>
          <circle cx="100" cy="50" r="5" fill="#ffeb3b" />
          <text x="115" y="55" className="text-xs fill-gray-600">
            Answer
          </text>
        </g>
      </svg>
    </div>
  );
};

export default WorldMap;
