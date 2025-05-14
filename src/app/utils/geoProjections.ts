// Geographic projection utilities for more advanced map rendering
// This file contains additional projection options beyond the basic Mercator

import {
  geoNaturalEarth1,
  geoOrthographic,
  geoStereographic,
  geoEquirectangular,
  geoAlbersUsa,
} from "d3-geo";
import { GeoProjection } from "d3-geo";

/**
 * Collection of different map projections for various visualization needs
 *
 * Different projections serve different purposes:
 * - Mercator: Good for navigation, preserves angles but distorts size
 * - Natural Earth: Visually pleasing world maps, balances distortion
 * - Orthographic: Shows Earth as a globe (3D effect)
 * - Equirectangular: Simple, preserves area ratios
 */

export type ProjectionType =
  | "mercator"
  | "naturalEarth"
  | "orthographic"
  | "equirectangular"
  | "stereographic"
  | "albersUsa";

// Create different types of map projections based on use case
export const createProjectionByType = (
  type: ProjectionType,
  width: number,
  height: number,
  centerCoordinates: [number, number] = [0, 0]
): GeoProjection => {
  const scale = Math.min(width, height) / 7; // Base scale calculation
  const center: [number, number] = [width / 2, height / 2];

  switch (type) {
    case "naturalEarth":
      // Natural Earth projection - great for world maps, visually pleasing
      return geoNaturalEarth1()
        .scale(scale * 1.3)
        .center(centerCoordinates)
        .translate(center);

    case "orthographic":
      // Orthographic projection - shows Earth as a globe
      // Good for showing one hemisphere at a time
      return geoOrthographic()
        .scale(scale * 1.8)
        .center(centerCoordinates)
        .translate(center)
        .rotate([-centerCoordinates[0], -centerCoordinates[1]]);

    case "equirectangular":
      // Equirectangular projection - simple grid, preserves area
      return geoEquirectangular()
        .scale(scale * 1.5)
        .center(centerCoordinates)
        .translate(center);

    case "stereographic":
      // Stereographic projection - preserves angles and shapes
      return geoStereographic()
        .scale(scale * 2)
        .center(centerCoordinates)
        .translate(center);

    case "albersUsa":
      // Albers USA projection - optimized for United States
      // Includes Alaska and Hawaii in convenient positions
      return geoAlbersUsa()
        .scale(scale * 0.8)
        .translate(center);

    default:
      // Default to Mercator for web maps
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const { geoMercator } = require("d3-geo");
      return geoMercator()
        .scale(scale)
        .center(centerCoordinates)
        .translate(center);
  }
};

// Create a projection optimized for a specific region
export const createRegionalProjection = (
  bounds: { minLon: number; maxLon: number; minLat: number; maxLat: number },
  width: number,
  height: number,
  padding: number = 20
): GeoProjection => {
  const centerLon = (bounds.minLon + bounds.maxLon) / 2;
  const centerLat = (bounds.minLat + bounds.maxLat) / 2;

  // Calculate the span of the region
  const spanLon = bounds.maxLon - bounds.minLon;
  const spanLat = bounds.maxLat - bounds.minLat;

  // Choose projection based on the region characteristics
  let projection: GeoProjection;

  if (spanLat > 60) {
    // For large areas covering many latitudes, use Natural Earth
    projection = geoNaturalEarth1();
  } else if (Math.abs(centerLat) > 60) {
    // For polar regions, use stereographic
    projection = geoStereographic();
  } else {
    // For most regions, Mercator works well
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { geoMercator } = require("d3-geo");
    projection = geoMercator();
  }

  // Calculate scale to fit the region within the canvas
  const scale =
    Math.min(
      (width - padding * 2) / ((spanLon * Math.PI) / 180),
      (height - padding * 2) / ((spanLat * Math.PI) / 180)
    ) * 40; // Empirical adjustment factor

  return projection
    .scale(scale)
    .center([centerLon, centerLat])
    .translate([width / 2, height / 2]);
};

// Utility to get projection information for educational purposes
export const getProjectionInfo = (type: ProjectionType) => {
  const info = {
    mercator: {
      name: "Mercator",
      description:
        "Preserves angles and shapes but distorts size, especially near poles",
      bestFor: "Navigation, web maps, detailed regional views",
      distortions: "Size increases dramatically toward poles",
    },
    naturalEarth: {
      name: "Natural Earth",
      description:
        "Balances size and shape distortions for pleasant world maps",
      bestFor: "World maps, atlas-style visualizations",
      distortions: "Minimal overall distortion, good compromise",
    },
    orthographic: {
      name: "Orthographic",
      description: "Shows Earth as it appears from space",
      bestFor: "Hemisphere views, showing Earth as a sphere",
      distortions: "Only shows one hemisphere, extreme distortion at edges",
    },
    equirectangular: {
      name: "Equirectangular",
      description: "Simple grid projection, preserves area relationships",
      bestFor: "Data visualization, simple world maps",
      distortions: "Horizontal stretching increases away from equator",
    },
    stereographic: {
      name: "Stereographic",
      description: "Preserves angles and local shapes",
      bestFor: "Polar regions, circular maps",
      distortions: "Size increases away from center point",
    },
    albersUsa: {
      name: "Albers USA",
      description:
        "Optimized for United States with repositioned Alaska/Hawaii",
      bestFor: "United States maps with all states visible",
      distortions:
        "Alaska and Hawaii moved for convenience, not geographically accurate",
    },
  };

  return info[type];
};

// Export constants for projection configuration
export const PROJECTION_CONSTANTS = {
  DEFAULT_PADDING: 20,
  SCALE_FACTORS: {
    mercator: 1.0,
    naturalEarth: 1.3,
    orthographic: 1.8,
    equirectangular: 1.5,
    stereographic: 2.0,
    albersUsa: 0.8,
  },
  // Common center points for different views
  CENTER_POINTS: {
    world: [0, 0],
    americas: [-90, 0],
    europe: [10, 50],
    africa: [20, 0],
    asia: [100, 30],
    oceania: [140, -25],
    arctic: [0, 90],
    antarctic: [0, -90],
  },
} as const;
