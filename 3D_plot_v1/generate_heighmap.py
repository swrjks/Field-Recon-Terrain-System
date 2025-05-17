import rasterio
import numpy as np
import json

# Load DEM (GeoTIFF)
with rasterio.open(r"C:\Users\swara\Desktop\Aventus_FRTS\dataset\n34_e077_1arc_v3.tif") as src:
    elevation = src.read(1).astype(np.float32)
    elevation[elevation == src.nodata] = np.nan

# Normalize to 0..1 for rendering
elevation = np.nan_to_num(elevation, nan=np.nanmin(elevation))
elev_min = np.min(elevation)
elev_max = np.max(elevation)
norm = (elevation - elev_min) / (elev_max - elev_min)

import rasterio

with rasterio.open("C:/Users/swara/Desktop/Aventus_FRTS/dataset/n34_e077_1arc_v3.tif") as src:
    transform = src.transform
    width = src.width
    height = src.height
    pixel_width = transform.a      # Degrees per pixel (longitude)
    pixel_height = -transform.e    # Degrees per pixel (latitude, negative value)
    
    # Rough conversion: 1 degree ≈ 111 km (varies by latitude slightly)
    x_km_total = width * pixel_width * 111
    y_km_total = height * pixel_height * 111

print(f"Terrain spans approx: {x_km_total:.2f} km (X) × {y_km_total:.2f} km (Y)")


# Downsample (for performance)
downscale = 4
norm_down = norm[::downscale, ::downscale]

# Save as JSON
with open("heightmap.json", "w") as f:
    json.dump(norm_down.tolist(), f)
