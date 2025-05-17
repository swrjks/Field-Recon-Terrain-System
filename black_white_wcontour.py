import json
import plotly.graph_objects as go
import numpy as np

with open("terrain_subset.json", "r") as f:
    terrain_data = json.load(f)

elevations = [[point["elevation"] for point in row] for row in terrain_data["data"]]
latitudes = [[point["lat"] for point in row] for row in terrain_data["data"]]
longitudes = [[point["lon"] for point in row] for row in terrain_data["data"]]

elevations = np.array(elevations)
latitudes = np.array(latitudes)
longitudes = np.array(longitudes)

fig = go.Figure(data=[go.Surface(
    z=elevations,
    x=longitudes,
    y=latitudes,
    colorscale='Greys',  # Subtle shading
    showscale=False,
    opacity=0.8,  # Slight transparency
    contours={
        "x": {"show": True, "color": "white", "width": 1},
        "y": {"show": True, "color": "white", "width": 1},
        "z": {"show": True, "color": "white", "width": 1},
    }
)])

fig.update_layout(
    title="3D Terrain Wireframe with Elevation",
    scene=dict(
        xaxis_title='Longitude',
        yaxis_title='Latitude',
        zaxis_title='Elevation (m)',
        xaxis=dict(showbackground=True, backgroundcolor="rgb(10, 10, 10)", color="white"),
        yaxis=dict(showbackground=True, backgroundcolor="rgb(10, 10, 10)", color="white"),
        zaxis=dict(showbackground=True, backgroundcolor="rgb(10, 10, 10)", color="white"),
    ),
    paper_bgcolor="rgb(10, 10, 10)",
    plot_bgcolor="rgb(10, 10, 10)",
    autosize=True,
    margin=dict(l=20, r=20, t=40, b=20),
    font=dict(color="white")
)

fig.show()