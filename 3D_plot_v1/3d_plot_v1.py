import json
import numpy as np
import plotly.graph_objects as go
from scipy.ndimage import gaussian_filter
import rasterio
import math

#--- CONFIGURATION ---
tif_path = r"C:\Users\manya\Desktop\frts\tif\datas\n34_e077_1arc_v3.tif"
json_path = "heightmap.json"
downscale = 4                     #Reduce resolution for performance
sigma = 1.5                       #Gaussian blur strength
elevation_scale = 50             #Vertical exaggeration

#--- STEP 1: Load GeoTIFF and process heightmap ---
with rasterio.open(tif_path) as src:
    elevation = src.read(1).astype(np.float32)
    elevation[elevation == src.nodata] = np.nan

    elevation = np.nan_to_num(elevation, nan=np.nanmin(elevation))
    elev_min = np.min(elevation)
    elev_max = np.max(elevation)
    norm = (elevation - elev_min) / (elev_max - elev_min)

    norm_down = norm[::downscale, ::downscale]

    with open(json_path, "w") as f:
        json.dump(norm_down.tolist(), f)

    #Geo dimensions
    transform = src.transform
    width = src.width
    height = src.height
    pixel_width_deg = transform.a
    pixel_height_deg = -transform.e

    width_ds = width // downscale
    height_ds = height // downscale

    lat_deg = 34
    lat_rad = math.radians(lat_deg)
    km_per_deg_lat = 111.32
    km_per_deg_lon = 111.32 * math.cos(lat_rad)

    x_km_total = width_ds * pixel_width_deg * km_per_deg_lon
    y_km_total = height_ds * pixel_height_deg * km_per_deg_lat

#--- STEP 2: Load smoothed heightmap from JSON ---
with open(json_path, "r") as f:
    height_data = json.load(f)

Z = np.array(height_data)
Z = gaussian_filter(Z, sigma=sigma) * elevation_scale

rows, cols = Z.shape
x = np.linspace(0, x_km_total, cols)
y = np.linspace(0, y_km_total, rows)
X, Y = np.meshgrid(x, y)

#--- STEP 3: Plot with Plotly ---
fig = go.Figure(data=go.Surface(
    x=X,
    y=Y,
    z=Z,
    colorscale="Viridis",
    showscale=True,
    contours={
        "z": {"show": True, "usecolormap": True, "highlightcolor": "limegreen", "project_z": True}
    },
    lighting=dict(ambient=0.5, diffuse=0.7, roughness=0.8, specular=0.5),
))

fig.add_annotation(
    text=f"Terrain span: {x_km_total:.2f} Km x {y_km_total:.2f} Km \n Area: {x_km_total*y_km_total:.2f} sq Km",
    xref="paper", yref="paper",
    x=0.5, y=1.05,
    showarrow=False,
    font=dict(size=12, color="white"),
    align="center",
    bgcolor="black",
    bordercolor="white",
    borderwidth=1
)

#Final layout
fig.update_layout(
    title="3D Terrain from DEM (Real Scale)",
    scene=dict(
        xaxis_title="X Km)",
        yaxis_title="Y (Km)",
        zaxis_title="Elevation (scaled)",
        aspectratio=dict(x=1, y=1, z=0.3),
    ),
    margin=dict(l=0, r=0, t=60, b=0),
    paper_bgcolor="black",
    font=dict(color="white")
)

fig.show()
