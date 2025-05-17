import json
import math
import numpy as np
import rasterio
from scipy.ndimage import gaussian_filter


TIF_PATH = "n34_e077_1arc_v3.tif"
HEIGHTMAP_JSON = "heightmap.json"
DOWNSCALE = 4


with rasterio.open(TIF_PATH) as src:
    elevation = src.read(1).astype(np.float32)
    elevation[elevation == src.nodata] = np.nan
    elevation = np.nan_to_num(elevation, nan=np.nanmin(elevation))

    elev_min = np.min(elevation)
    elev_max = np.max(elevation)
    norm = (elevation - elev_min) / (elev_max - elev_min)
    norm_down = norm[::DOWNSCALE, ::DOWNSCALE]

    transform = src.transform
    full_width = src.width
    full_height = src.height

with open(HEIGHTMAP_JSON, "w") as f:
    json.dump(norm_down.tolist(), f)


with open(HEIGHTMAP_JSON, "r") as f:
    height_data = json.load(f)

Z = np.array(height_data)
Z = gaussian_filter(Z, sigma=1.5)[::2, ::2] 

rows, cols = Z.shape


x = np.linspace(0, 1, cols)
y = np.linspace(0, 1, rows)
X, Y = np.meshgrid(x, y)


pixel_width_deg = transform.a
pixel_height_deg = -transform.e

lat_deg = 34
lat_rad = math.radians(lat_deg)
km_per_deg_lat = 111.32
km_per_deg_lon = 111.32 * math.cos(lat_rad)

width_ds = full_width // DOWNSCALE
height_ds = full_height // DOWNSCALE

x_km_total = width_ds * pixel_width_deg * km_per_deg_lon
y_km_total = height_ds * pixel_height_deg * km_per_deg_lat


downscale_x = full_width // cols
downscale_y = full_height // rows

grid_dx_km = pixel_width_deg * 111 * downscale_x
grid_dy_km = pixel_height_deg * 111 * downscale_y

def interpolate_path(p1, p2, steps=100):
    x1, y1 = p1
    x2, y2 = p2
    x_vals = np.linspace(x1, x2, steps).astype(int)
    y_vals = np.linspace(y1, y2, steps).astype(int)
    x_vals = np.clip(x_vals, 0, cols - 1)
    y_vals = np.clip(y_vals, 0, rows - 1)
    return x_vals, y_vals
