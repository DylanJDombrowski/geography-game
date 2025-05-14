import { geoMercator, geoPath, GeoProjection } from "d3-geo";
import { CountryFeature, DIFFICULTY_CONFIGS } from "./types";
import { Feature, Geometry, FeatureCollection } from "geojson";

/**
 * Map Utility Functions
 *
 * This file handles all geographic calculations and map projections.
 * It converts real-world coordinates into screen coordinates and handles
 * different map projections for optimal display.
 */

// Interface for raw Natural Earth data before processing
// We define this directly without extending GeoJsonProperties to avoid TS issues
interface RawCountryProperties {
  NAME?: string;
  ADMIN?: string;
  NAME_EN?: string;
  NAME_LONG?: string;
  ISO_A2?: string;
  ISO_A3?: string;
  ISO?: string;
  POP_EST?: number | string;
  CONTINENT?: string;
  SUBREGION?: string;
  REGION_UN?: string;
  REGION_WB?: string;
  TYPE?: string;
  // Allow any additional properties that Natural Earth might include
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// Type aliases instead of empty interfaces to avoid linting issues
type RawCountryFeature = Feature<Geometry, RawCountryProperties>;
type RawGeoJsonData = FeatureCollection<Geometry, RawCountryProperties>;

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
  feature: RawCountryFeature
): feature is RawCountryFeature => {
  return (
    feature &&
    feature.type === "Feature" &&
    feature.properties &&
    (typeof feature.properties.NAME === "string" ||
      typeof feature.properties.ADMIN === "string") &&
    (typeof feature.properties.ISO_A2 === "string" ||
      typeof feature.properties.ISO === "string") &&
    feature.geometry &&
    (feature.geometry.type === "Polygon" ||
      feature.geometry.type === "MultiPolygon")
  );
};

// Helper function to safely convert population estimate to number
const parsePopulation = (pop: string | number | undefined): number => {
  if (typeof pop === "number") return pop;
  if (typeof pop === "string") {
    const parsed = parseFloat(pop);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

// Helper function to get best available name
const getBestName = (props: RawCountryProperties): string => {
  return props.NAME || props.ADMIN || props.NAME_EN || "Unknown";
};

// Helper function to get best available ISO code
const getBestIsoCode = (props: RawCountryProperties): string => {
  return props.ISO_A2 || props.ISO || "";
};

// Clean and prepare country data after loading
export const prepareCountryData = (
  rawData: RawGeoJsonData
): CountryFeature[] => {
  if (!rawData.features || !Array.isArray(rawData.features)) {
    throw new Error("Invalid GeoJSON data structure");
  }

  return rawData.features
    .filter(validateCountryFeature)
    .map((feature: RawCountryFeature): CountryFeature => {
      // Clean up properties with better fallbacks
      const props = feature.properties;
      const name = getBestName(props);
      const isoA2 = getBestIsoCode(props);

      const cleanedProperties = {
        NAME: name,
        ADMIN: props.ADMIN || name,
        NAME_LONG: props.NAME_LONG || name,
        POP_EST: parsePopulation(props.POP_EST),
        CONTINENT: props.CONTINENT || props.REGION_UN || "Unknown",
        SUBREGION: props.SUBREGION || props.REGION_WB || "",
        REGION_UN: props.REGION_UN || "",
        REGION_WB: props.REGION_WB || "",
        ISO_A2: isoA2,
        ISO_A3: props.ISO_A3 || "",
      };

      return {
        type: feature.type,
        geometry: feature.geometry,
        properties: cleanedProperties,
      } as CountryFeature;
    })
    .filter((feature: CountryFeature): boolean => {
      // Additional filtering to ensure we have essential data
      return (
        typeof feature.properties.NAME === "string" &&
        feature.properties.NAME !== "Unknown" &&
        typeof feature.properties.ISO_A2 === "string" &&
        feature.properties.ISO_A2 !== "-99"
      ); // Natural Earth uses -99 for unknown
    })
    .sort((a: CountryFeature, b: CountryFeature): number =>
      a.properties.NAME.localeCompare(b.properties.NAME)
    );
};

// Type guard to check if loaded data matches our expected structure
export const isValidGeoJsonData = (data: unknown): data is RawGeoJsonData => {
  if (typeof data !== "object" || data === null) {
    return false;
  }

  const obj = data as Record<string, unknown>;

  return (
    obj.type === "FeatureCollection" &&
    "features" in obj &&
    Array.isArray(obj.features)
  );
};

// Export types for use in other files
export type { RawGeoJsonData, RawCountryFeature, RawCountryProperties };
