# Field Recon Terrain System (FRTS)

## Track Chosen:
**AI in Defense and Disaster Response**

---

## Problem Statement:
Defense personnel and disaster response teams are often deployed in unfamiliar, high-risk terrains such as **hilly regions**, **dense forests**, or **disaster-hit zones**. In these situations, they lack access to **real-time terrain awareness** and face difficulties in **navigation** and **mission planning**. This increases operational risk, delays response times, and reduces mission efficiency.

There is a strong need for a system that can provide:
- Accurate **3D terrain insights**
- **Intelligent navigation** and **safe path planning**
- **Local environmental and hazard intelligence**
- **Real-time or offline availability** for field use

---

## Proposed Solution: Field Recon Terrain System (FRTS)

The **Field Recon Terrain System (FRTS)** is an interactive, AI-powered terrain navigation and analysis tool built to assist in defense and disaster response operations.

### Key Features:
- 3D terrain modeling using satellite elevation data
- AI-based shortest and safest path computation
- Terrain hazard and slope estimation
- Interactive visual navigation interface
- Online + Offline operability

### Deployment Note:
FRTS is **not a web-based application or public-facing app**. It is designed as an **offline software tool** that runs locally to **minimize security risks and avoid data breaches** in sensitive missions. It can also be **integrated into customized defense vehicles** for real-time usage, terrain-based planning, and mission-critical operations in remote or disconnected regions.

---

## Phase 1: Data Extraction
We begin with **GeoTIFF files**, which are raster images containing elevation and geographic metadata. We:

- Perform **spatial subsetting** to extract a relevant region
- Convert **raster pixels** into coordinate-elevation pairs
- Generate a **structured JSON** for elevation mapping

This enables:
- Accurate contour plotting
- Coordinate-aligned terrain modeling


---

## Phase 2: Plotting Detailed Terrain
Using the preprocessed elevation data:
- We create a **responsive 3D terrain plot**
- Allow **interactive marker placement**
- Support **real-time planning** through a web-based UI

This lays the foundation for route evaluation and spatial awareness.

---

## Phase 3: AI-Powered Pathfinding
We implement an AI model to predict the **cost of terrain traversal** based on:
- Normalized coordinates (x, y)
- Elevation
- Slope
- Distance to goal

![pics/"Optimal Path"](https://github.com/swrjks/Field-Recon-Terrain-System/blob/a60554a09f610f0ca024004d2b8486d5bdd96e40/pics/Optimal_path_ai.png)


### Model Architecture:
- A **Multilayer Perceptron (MLP)** with one hidden layer
- **ReLU** activation for non-linearity
- **MSE loss** for regression training
- Learns a **composite cost function** for navigation

> y = Linear(ReLU(Linear(x)))

This enables adaptive, terrain-aware path planning beyond simple heuristics.

## Phase 4: Interactive Navigation (In Progress)
- Enable **click-to-place markers** on 3D map
- Allow **real-time path previews** between points
- Add **draggable markers** and terrain-clamped lines

---
_"Navigating unknown terrain should never be guesswork"_
  
