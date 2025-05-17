import json
import numpy as np
import plotly.graph_objects as go
from dash import Dash, dcc, html, Output, Input, State
import dash_bootstrap_components as dbc

from preprocessing import Z, X, Y, interpolate_path, grid_dx_km, grid_dy_km, x_km_total, y_km_total

rows, cols = Z.shape

app = Dash(__name__, external_stylesheets=[dbc.themes.SLATE])
server = app.server

def create_3d_figure(markers=[], follow_path=None, camera=None):
    fig = go.Figure()

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

    for i, (gx, gy) in enumerate(markers):
        mx, my = X[gy, gx], Y[gy, gx]
        mz = Z[gy, gx] * 50
        fig.add_trace(go.Scatter3d(
            x=[mx], y=[my], z=[mz + 4],
            mode="markers+text",
            marker=dict(size=8, color="red", symbol='diamond'),
            text=[f"P{i+1}"],
            textposition="top center"
        ))

    if follow_path:
        xs, ys = follow_path
        zs = Z[ys, xs] * 50 + 2
        fig.add_trace(go.Scatter3d(
            x=X[ys, xs],
            y=Y[ys, xs],
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
            aspectratio=dict(x=1, y=1, z=0.3)
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
            dcc.Graph(id='terrain-plot', config={"scrollZoom": True}, style={"height": "85vh"})
        ])
    ]),
    dbc.Row([
        dbc.Col(html.Div(id='info-box', className="p-2 text-center"), width=12)
    ]),
    dcc.Store(id='marker-store', data=[]),
    dcc.Store(id='camera-store', data={})
], fluid=True)

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
        return create_3d_figure(camera=camera_data), stored_markers, "Click to place markers.", "", camera_data

    clicked_x = float(clickData['points'][0]['x'])
    clicked_y = float(clickData['points'][0]['y'])
    grid_x = int(np.round(clicked_x * (cols - 1)))
    grid_y = int(np.round(clicked_y * (rows - 1)))

    stored_markers.append((grid_x, grid_y))
    if len(stored_markers) > 2:
        stored_markers = stored_markers[-2:]

    summary = ""
    follow_path = None

    if len(stored_markers) == 2:
        (x1, y1), (x2, y2) = stored_markers
        z1 = Z[y1, x1] * 50
        z2 = Z[y2, x2] * 50
        dz = abs(z2 - z1)
        dx_km = (x2 - x1) * grid_dx_km
        dy_km = (y2 - y1) * grid_dy_km
        true_3d_dist_km = np.sqrt(dx_km**2 + dy_km**2 + dz**2)

        follow_path = interpolate_path((x1, y1), (x2, y2))
        summary = f"3D Distance: {true_3d_dist_km:.2f} Km | Elevation Difference: {dz:.2f} Km"

    fig = create_3d_figure(markers=stored_markers, follow_path=follow_path, camera=camera_data)
    return fig, stored_markers, "", summary, camera_data

if __name__ == "__main__":
    app.run(debug=False)