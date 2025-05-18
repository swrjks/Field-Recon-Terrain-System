import json
import math
import numpy as np
import rasterio
from scipy.ndimage import gaussian_filter

DOWNSCALE = 4

def load_current_terrain():
    # Read TIF file path from marker file
    with open("current_tif.txt", "r") as f:
        tif_path = f.read().strip()

    with rasterio.open(tif_path) as src:
        elevation = src.read(1).astype(np.float32)
        elevation[elevation == src.nodata] = np.nan
        elevation = np.nan_to_num(elevation, nan=np.nanmin(elevation))

        elev_min = np.min(elevation)
        elev_max = np.max(elevation)
        norm = (elevation - elev_min) / (elev_max - elev_min)
        norm_down = norm[::DOWNSCALE, ::DOWNSCALE]
        norm_down = gaussian_filter(norm_down, sigma=1.5)[::2, ::2]

        rows, cols = norm_down.shape
        x = np.linspace(0, 1, cols)
        y = np.linspace(0, 1, rows)
        X, Y = np.meshgrid(x, y)
        Z = norm_down

        # Spatial transform
        transform = src.transform
        pixel_width_deg = transform.a
        pixel_height_deg = -transform.e

        # Use the center latitude for more accurate scaling
        center_lat = src.bounds.top - (src.bounds.top - src.bounds.bottom) / 2
        lat_rad = math.radians(center_lat)

        km_per_deg_lat = 111.32
        km_per_deg_lon = 111.32 * math.cos(lat_rad)

        full_width = src.width
        full_height = src.height

        width_ds = full_width // DOWNSCALE
        height_ds = full_height // DOWNSCALE

        x_km_total = width_ds * pixel_width_deg * km_per_deg_lon
        y_km_total = height_ds * pixel_height_deg * km_per_deg_lat

        downscale_x = full_width // cols
        downscale_y = full_height // rows

        grid_dx_km = pixel_width_deg * 111 * downscale_x
        grid_dy_km = pixel_height_deg * 111 * downscale_y

    return Z, X, Y, grid_dx_km, grid_dy_km, x_km_total, y_km_total

def interpolate_path(p1, p2, steps=100):
    x1, y1 = p1
    x2, y2 = p2
    x_vals = np.linspace(x1, x2, steps).astype(int)
    y_vals = np.linspace(y1, y2, steps).astype(int)

    # Clamp to valid indices
    Z_shape = load_current_terrain()[0].shape
    x_vals = np.clip(x_vals, 0, Z_shape[1] - 1)
    y_vals = np.clip(y_vals, 0, Z_shape[0] - 1)

    return x_vals, y_vals
