import json
import numpy as np
import plotly.graph_objects as go

# Load heightmap data (your heightmap.json)
with open("heightmap.json", "r") as f:
    height_data = json.load(f)

Z = np.array(height_data)
rows, cols = Z.shape

# Generate coordinate grid
x = np.linspace(0, 1, cols)
y = np.linspace(0, 1, rows)
X, Y = np.meshgrid(x, y)

# Create interactive 3D surface wireframe
fig = go.Figure(data=go.Surface(
    x=X,
    y=Y,
    z=Z * 50,  # Scale elevation
    colorscale="Viridis",
    showscale=True,
    contours={
        "z": {"show": True, "usecolormap": True, "highlightcolor": "limegreen", "project_z": True}
    },
    lighting=dict(ambient=0.5, diffuse=0.7, roughness=0.8, specular=0.5),
))

fig.update_layout(
    title="3D Terrain Wireframe (Python)",
    scene=dict(
        xaxis_title="X",
        yaxis_title="Y",
        zaxis_title="Elevation",
        aspectratio=dict(x=1, y=1, z=0.3),
    ),
    margin=dict(l=0, r=0, t=40, b=0)
)

fig.show()
