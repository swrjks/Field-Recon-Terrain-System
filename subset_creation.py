import rasterio
from rasterio.windows import from_bounds
from rasterio.transform import Affine
import json

# User input
center_lat = 34.08
center_lon = 77.5
area_km = 20  # e.g., extract 5km x 5km region

# Approx degree per km (simple approx)
degree_per_km = 1 / 111.0
half_deg = (area_km / 2) * degree_per_km

# Bounding box
min_lon = center_lon - half_deg
max_lon = center_lon + half_deg
min_lat = center_lat - half_deg
max_lat = center_lat + half_deg

tif_path = r"C:\Users\swara\Desktop\Aventus_FRTS\dataset\n34_e077_1arc_v3.tif"

# Open and extract the window
with rasterio.open(tif_path) as src:
    window = from_bounds(min_lon, min_lat, max_lon, max_lat, src.transform)
    data = src.read(1, window=window)
    transform = src.window_transform(window)

    height, width = data.shape
    coords = []
    for y in range(height):
        row = []
        for x in range(width):
            lon, lat = transform * (x, y)
            row.append({
                "lat": lat,
                "lon": lon,
                "elevation": float(data[y][x])
            })
        coords.append(row)

# Save to JSON
output = {
    "width": width,
    "height": height,
    "data": coords
}

with open("terrain_subset.json", "w") as f:
    json.dump(output, f, indent=2)

print(f"Saved terrain data for {area_km}km x {area_km}km at lat={center_lat}, lon={center_lon}")
