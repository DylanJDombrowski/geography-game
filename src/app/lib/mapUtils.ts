import { geoMercator, geoPath, GeoProjection } from "d3-geo";
import { CountryFeature, DIFFICULTY_CONFIGS } from "./types";
import { Feature, Geometry } from "geojson";

/**
 * Map Utility Functions
 *
 * This file handles all geographic calculations and map projections.
 * It converts real-world coordinates into screen coordinates and handles
 * different map projections for optimal display.
 */

// Create a Mercator projection optimized for our world map display
export const createProjection = (
  width: number,
  height: number
): GeoProjection => {
  return geoMercator()
    .scale(width / 6.5) // Scale factor - smaller numbers zoom out more
    .center([0, 20]) // Center point [longitude, latitude]
    .translate([width / 2, height / 2]); // Position the center of the projection
};

// Convert a GeoJSON feature to an SVG path string
export const featureToPath = (
  feature: CountryFeature,
  projection: GeoProjection
): string => {
  // d3-geo expects a standard GeoJSON feature, which our CountryFeature now extends
  const pathGenerator = geoPath().projection(projection);

  // The pathGenerator can handle the feature directly now that types are aligned
  const path = pathGenerator(feature as Feature<Geometry>);
  return path || "";
};

// Calculate geographic bounds to optimize map zoom and centering
export const calculateBounds = (features: CountryFeature[]) => {
  let minLon = Infinity,
    minLat = Infinity,
    maxLon = -Infinity,
    maxLat = -Infinity;

  features.forEach((feature) => {
    const { geometry } = feature;

    // Handle both Polygon and MultiPolygon geometries
    if (geometry.type === "Polygon") {
      // For Polygon, coordinates is an array of linear rings
      geometry.coordinates.forEach((ring) => {
        ring.forEach(([lon, lat]) => {
          minLon = Math.min(minLon, lon);
          maxLon = Math.max(maxLon, lon);
          minLat = Math.min(minLat, lat);
          maxLat = Math.max(maxLat, lat);
        });
      });
    } else if (geometry.type === "MultiPolygon") {
      // For MultiPolygon, coordinates is an array of polygons
      geometry.coordinates.forEach((polygon) => {
        polygon.forEach((ring) => {
          ring.forEach(([lon, lat]) => {
            minLon = Math.min(minLon, lon);
            maxLon = Math.max(maxLon, lon);
            minLat = Math.min(minLat, lat);
            maxLat = Math.max(maxLat, lat);
          });
        });
      });
    }
  });

  return {
    minLon,
    minLat,
    maxLon,
    maxLat,
    // Calculate center point
    centerLon: (minLon + maxLon) / 2,
    centerLat: (minLat + maxLat) / 2,
    // Calculate span for zoom calculations
    spanLon: maxLon - minLon,
    spanLat: maxLat - minLat,
  };
};

// Filter countries using the configuration from types
export const filterCountriesByDifficulty = (
  countries: CountryFeature[],
  difficulty: keyof typeof DIFFICULTY_CONFIGS
): CountryFeature[] => {
  const config = DIFFICULTY_CONFIGS[difficulty];
  return countries.filter(config.filter);
};

// Create an optimized projection based on the actual data bounds
export const createFittedProjection = (
  features: CountryFeature[],
  width: number,
  height: number
): GeoProjection => {
  const bounds = calculateBounds(features);

  // Create a projection that fits the data within the specified dimensions
  const projection = geoMercator();

  // Calculate scale to fit the bounds within our canvas
  const scale = Math.min(width / bounds.spanLon, height / bounds.spanLat) * 80; // Multiply by factor to leave some padding

  return projection
    .scale(scale)
    .center([bounds.centerLon, bounds.centerLat])
    .translate([width / 2, height / 2]);
};

// Helper function to get the area of a country (approximate)
export const getCountryArea = (feature: CountryFeature): number => {
  // This is a simplified area calculation
  // In a production app, you'd use a proper geographic area calculation
  let totalArea = 0;

  const { geometry } = feature;

  if (geometry.type === "Polygon") {
    // Calculate area of the main polygon (outer ring)
    const outerRing = geometry.coordinates[0];
    totalArea += calculatePolygonArea(outerRing);
  } else if (geometry.type === "MultiPolygon") {
    // Sum areas of all polygons
    geometry.coordinates.forEach((polygon) => {
      const outerRing = polygon[0];
      totalArea += calculatePolygonArea(outerRing);
    });
  }

  return totalArea;
};

// Simple polygon area calculation (Shoelace formula)
// Note: This gives a relative area, not actual square kilometers
const calculatePolygonArea = (coordinates: number[][]): number => {
  let area = 0;
  const n = coordinates.length;

  for (let i = 0; i < n - 1; i++) {
    const [x1, y1] = coordinates[i];
    const [x2, y2] = coordinates[i + 1];
    area += x1 * y2 - x2 * y1;
  }

  return Math.abs(area) / 2;
};

// Validate that a feature has the required properties for our game
export const validateCountryFeature = (
  feature: any
): feature is CountryFeature => {
  return (
    feature &&
    feature.type === "Feature" &&
    feature.properties &&
    typeof feature.properties.NAME === "string" &&
    typeof feature.properties.ISO_A2 === "string" &&
    feature.geometry &&
    (feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon")
  );
};

// Clean and prepare country data after loading
export const prepareCountryData = (rawData: any): CountryFeature[] => {
  if (!rawData.features || !Array.isArray(rawData.features)) {
    throw new Error("Invalid GeoJSON data structure");
  }

  return rawData.features
    .filter(validateCountryFeature)
    .map((feature: CountryFeature) => ({
      ...feature,
      // Ensure all required properties exist with fallbacks
      properties: {
        ...feature.properties,
        NAME: feature.properties.NAME || feature.properties.ADMIN || "Unknown",
        NAME_LONG:
          feature.properties.NAME_LONG ||
          feature.properties.NAME ||
          feature.properties.ADMIN,
        POP_EST: feature.properties.POP_EST || 0,
        CONTINENT: feature.properties.CONTINENT || "Unknown",
        SUBREGION: feature.properties.SUBREGION || "",
        REGION_UN: feature.properties.REGION_UN || "",
        REGION_WB: feature.properties.REGION_WB || "",
      },
    }))
    .sort(
      (a: { properties: { NAME: string } }, b: { properties: { NAME: any } }) =>
        a.properties.NAME.localeCompare(b.properties.NAME)
    );
};
