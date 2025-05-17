import json
import plotly.graph_objects as go
import numpy as np

with open("terrain_subset.json", "r") as f:   #Json file of subest generated from tiff file downloadead(GEOTIFF-Elevation)
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
    colorscale='Viridis',
    showscale=True
)])

fig.update_layout(
    title="3D Terrain Elevation Map",
    scene=dict(
        xaxis_title='Longitude',
        yaxis_title='Latitude',
        zaxis_title='Elevation (m)'
    ),
    autosize=True,
    margin=dict(l=20, r=20, t=40, b=20)
)

fig.show()
