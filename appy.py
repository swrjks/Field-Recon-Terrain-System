import json
import numpy as np
import plotly.graph_objects as go
from scipy.ndimage import gaussian_filter
from dash import Dash, dcc, html, Output, Input, State
import dash_bootstrap_components as dbc
import rasterio
import math

# Load DEM (GeoTIFF)
with rasterio.open(r"C:\Users\manya\Desktop\frts\tif\datas\n34_e077_1arc_v3.tif") as src:
    elevation = src.read(1).astype(np.float32)
    elevation[elevation == src.nodata] = np.nan

# Normalize to 0..1 for rendering
elevation = np.nan_to_num(elevation, nan=np.nanmin(elevation))
elev_min = np.min(elevation)
elev_max = np.max(elevation)
norm = (elevation - elev_min) / (elev_max - elev_min)

# Downsample (for performance)
downscale = 4
norm_down = norm[::downscale, ::downscale]

# Save as JSON
with open("heightmap.json", "w") as f:
    json.dump(norm_down.tolist(), f)

transform = src.transform
width = src.width
height = src.height
pixel_width_deg = transform.a
pixel_height_deg = -transform.e

# Adjusted resolution (after downsampling)
width_ds = width // downscale
height_ds = height // downscale

# Calculate real-world distance at 34°N
lat_deg = 34
lat_rad = math.radians(lat_deg)
km_per_deg_lat = 111.32
km_per_deg_lon = 111.32 * math.cos(lat_rad)

x_km_total = width_ds * pixel_width_deg * km_per_deg_lon
y_km_total = height_ds * pixel_height_deg * km_per_deg_lat

with open("heightmap.json", "r") as f:
    height_data = json.load(f)

Z = np.array(height_data)
Z = gaussian_filter(Z, sigma=1.5)[::2, ::2]  #smoother

rows, cols = Z.shape

# --- Load original GeoTIFF transform ---
with rasterio.open(r"C:\Users\manya\Desktop\frts\tif\datas\n34_e077_1arc_v3.tif") as src:
    transform = src.transform
    full_width = src.width
    full_height = src.height
    pixel_width_deg = transform.a
    pixel_height_deg = -transform.e

# --- Convert to kilometers (1 degree ≈ 111 km) ---
pixel_width_km = pixel_width_deg * 111
pixel_height_km = pixel_height_deg * 111

# --- Calculate downscaling factor (based on JSON vs original tif size) ---
downscale_x = full_width // cols
downscale_y = full_height // rows

# --- Final per-grid-cell size in kilometers ---
grid_dx_km = pixel_width_km * downscale_x
grid_dy_km = pixel_height_km * downscale_y

# --- Coordinate mesh (not used directly but left for reference) ---
x = np.linspace(0, 1, cols)
y = np.linspace(0, 1, rows)
X, Y = np.meshgrid(x, y)

# --- Helper: interpolate path that hugs surface ---
def interpolate_path(p1, p2, steps=100):
    x1, y1 = p1
    x2, y2 = p2
    x_vals = np.linspace(x1, x2, steps).astype(int)
    y_vals = np.linspace(y1, y2, steps).astype(int)
    x_vals = np.clip(x_vals, 0, cols - 1)
    y_vals = np.clip(y_vals, 0, rows - 1)
    return x_vals, y_vals

# --- Dash app setup ---
app = Dash(__name__, external_stylesheets=[dbc.themes.SLATE])
server = app.server

def create_3d_figure(markers=[], follow_path=None, camera=None):
    fig = go.Figure()

    # Terrain surface
    fig.add_trace(go.Surface(
        x=X,
        y=Y,
        z=Z * 50,
        colorscale="Viridis",
        showscale=False,
        contours={"z": {"show": False}},
        lighting=dict(ambient=0.5, diffuse=0.7, roughness=0.9, specular=0.5),
        opacity=1.0
    ))

    # Markers
    for i, (gx, gy) in enumerate(markers):
        mx, my = X[gy, gx], Y[gy, gx]
        mz = Z[gy, gx] * 50
        fig.add_trace(go.Scatter3d(
            x=[mx], y=[my], z=[mz + 4],
            mode="markers+text",
            marker=dict(size=8, color="red", symbol='diamond'),
            text=[f"P{i+1}"],
            textposition="top center",
            name=f"Marker {i+1}"
        ))

    # Path
    if follow_path:
        xs, ys = follow_path
        zs = Z[ys, xs] * 50 + 2
        path_x = X[ys, xs]
        path_y = Y[ys, xs]
        fig.add_trace(go.Scatter3d(
            x=path_x,
            y=path_y,
            z=zs,
            mode="lines",
            line=dict(color="orange", width=5),
            name="Surface Path"
        ))

    fig.update_layout(
        title="3D Terrain Navigator",
        scene=dict(
            xaxis=dict(title="X", showgrid=False),
            yaxis=dict(title="Y", showgrid=False),
            zaxis=dict(title="Elevation", showgrid=False),
            aspectratio=dict(x=1, y=1, z=0.3),
        ),
        margin=dict(l=10, r=10, t=40, b=10),
        template="plotly_dark"
    )

    fig.add_annotation(
    text=f"Terrain span: {x_km_total:.2f} km x {y_km_total:.2f} km \n Area: {x_km_total*y_km_total:.2f} sq km",
    xref="paper", yref="paper",
    x=0.5, y=1.05,
    showarrow=False,
    font=dict(size=12, color="white"),
    align="center",
    bgcolor="black",
    bordercolor="white",
    borderwidth=1
)

    if camera:
        fig.update_layout(scene_camera=camera)

    return fig


# --- Layout ---
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.Div(id='summary-box', className="text-center fw-bold p-2", style={
            "backgroundColor": "#1e1e1e",
            "color": "#00ffc8",
            "border": "1px solid #00ffc8",
            "borderRadius": "8px",
            "marginTop": "10px",
            "marginBottom": "10px",
            "fontSize": "1rem"
        }), width=12)
    ]),
    dbc.Row([
        dbc.Col([
            dcc.Graph(
                id='terrain-plot',
                figure=create_3d_figure(),
                config={"scrollZoom": True},
                style={"height": "85vh"}
            )
        ])
    ]),
    dbc.Row([
        dbc.Col(html.Div(id='info-box', className="p-2 text-center"), width=12)
    ]),
    dcc.Store(id='marker-store', data=[]),
    dcc.Store(id='camera-store', data={}) 
], fluid=True)



# --- Callbacks ---
@app.callback(
    Output('terrain-plot', 'figure'),
    Output('marker-store', 'data'),
    Output('info-box', 'children'),
    Output('summary-box', 'children'),
    Output('camera-store', 'data'),
    Input('terrain-plot', 'clickData'),
    State('marker-store', 'data'),
    State('camera-store', 'data'),
    State('terrain-plot', 'relayoutData')
)
def on_click(clickData, stored_markers, camera_data, relayout_data):
    if relayout_data and 'scene.camera' in relayout_data:
        camera_data = relayout_data['scene.camera']

    if not clickData:
        fig = create_3d_figure(camera=camera_data)
        return fig, stored_markers, "Click to place markers on the terrain.", "", camera_data

    clicked_x = float(clickData['points'][0]['x'])
    clicked_y = float(clickData['points'][0]['y'])

    grid_x = int(np.round(clicked_x * (cols - 1)))
    grid_y = int(np.round(clicked_y * (rows - 1)))

    stored_markers.append((grid_x, grid_y))
    if len(stored_markers) > 2:
        stored_markers = stored_markers[-2:]

    follow_path = None
    summary = ""
    info = f"Marker 1: ({grid_x}, {grid_y})"

    if len(stored_markers) == 2:
        (x1, y1), (x2, y2) = stored_markers

        z1 = Z[y1, x1] * 50
        z2 = Z[y2, x2] * 50
        dz = z2 - z1

        dx_km = (x2 - x1) * grid_dx_km
        dy_km = (y2 - y1) * grid_dy_km
        # horizontal_dist_km = np.sqrt(dx_km**2 + dy_km**2)
        true_3d_dist_km = np.sqrt(dx_km**2 + dy_km**2 + dz**2)

        follow_path = interpolate_path((x1, y1), (x2, y2))

        summary = f"3D Distance: {true_3d_dist_km:.2f} Km | Elevation Difference: {dz:.2f} Km "

    fig = create_3d_figure(markers=stored_markers, follow_path=follow_path, camera=camera_data)
    return fig, stored_markers, info, summary, camera_data

# --- Run ---
if __name__ == "__main__":
    app.run(debug=True)
