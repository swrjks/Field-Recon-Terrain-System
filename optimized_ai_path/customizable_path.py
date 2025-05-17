import numpy as np
import plotly.graph_objects as go
from dash import Dash, dcc, html, Output, Input, State
import dash_bootstrap_components as dbc
import dash
from preprocessing import Z, X, Y, interpolate_path, grid_dx_km, grid_dy_km, x_km_total, y_km_total

rows, cols = Z.shape

app = Dash(__name__, external_stylesheets=[dbc.themes.SLATE])
server = app.server

def create_3d_figure(red_markers, yellow_markers, follow_path=None, camera=None):
    fig = go.Figure()

    # Terrain Surface
    fig.add_trace(go.Surface(
        x=X, y=Y, z=Z * 50,
        colorscale="Viridis", showscale=False,
        lighting=dict(ambient=0.5, diffuse=0.7, roughness=0.9, specular=0.5)
    ))

    # Red markers (first two)
    for i, (gx, gy) in enumerate(red_markers):
        fig.add_trace(go.Scatter3d(
            x=[X[gy, gx]], y=[Y[gy, gx]], z=[Z[gy, gx] * 50 + 4],
            mode="markers+text",
            marker=dict(size=8, color="red", symbol='diamond'),
            text=[f"P{i+1}"], textposition="top center"
        ))

    # Yellow path that hugs terrain surface
    if len(yellow_markers) >= 2:
        path_x, path_y, path_z = [], [], []

        for i in range(len(yellow_markers) - 1):
            (gx1, gy1) = yellow_markers[i]
            (gx2, gy2) = yellow_markers[i + 1]

            # Interpolate grid indices between two yellow markers
            interp_gx, interp_gy = interpolate_path((gx1, gy1), (gx2, gy2))
            interp_x = X[interp_gy, interp_gx]
            interp_y = Y[interp_gy, interp_gx]
            interp_z = Z[interp_gy, interp_gx] * 50 + 4

            path_x.extend(interp_x)
            path_y.extend(interp_y)
            path_z.extend(interp_z)

        fig.add_trace(go.Scatter3d(
            x=path_x, y=path_y, z=path_z,
            mode="lines+markers",
            marker=dict(color="yellow", size=4),
            line=dict(color="yellow", width=3),
            name="Drawn Path"
        ))

    # AI-generated path between red markers
    if follow_path:
        xs, ys = follow_path
        zs = Z[ys, xs] * 50 + 2
        fig.add_trace(go.Scatter3d(
            x=X[ys, xs], y=Y[ys, xs], z=zs,
            mode="lines",
            line=dict(color="orange", width=5),
            name="AI Path"
        ))

    fig.update_layout(
        title="3D Terrain Navigator",
        scene=dict(
            xaxis=dict(showgrid=False), yaxis=dict(showgrid=False), zaxis=dict(showgrid=False),
            aspectratio=dict(x=1, y=1, z=0.3)
        ),
        template="plotly_dark",
        margin=dict(l=10, r=10, t=40, b=10)
    )

    fig.add_annotation(
        text=f"Terrain span: {x_km_total:.2f} km x {y_km_total:.2f} km<br>Area: {x_km_total * y_km_total:.2f} sq km",
        xref="paper", yref="paper", x=0.5, y=1.05,
        showarrow=False, font=dict(size=12, color="white"),
        bgcolor="black", bordercolor="white", borderwidth=1
    )

    if camera:
        fig.update_layout(scene_camera=camera)

    return fig


# Layout
app.layout = dbc.Container([
    dbc.Row([
        dbc.Col(html.Div(id='summary-box', className="text-center fw-bold p-2", style={
            "backgroundColor": "#1e1e1e", "color": "#00ffc8", "border": "1px solid #00ffc8",
            "borderRadius": "8px", "marginTop": "10px", "marginBottom": "10px", "fontSize": "1rem"
        }), width=12)
    ]),
    dbc.Row([
        dbc.Col([
            dcc.Graph(id='terrain-plot', style={"height": "85vh"}, config={"scrollZoom": True}),
            html.Div([
                dbc.Button("Clear Red Markers", id="clear-red", color="danger", className="me-2"),
                dbc.Button("Clear Yellow Path", id="clear-yellow", color="warning")
            ], className="text-center mt-2")
        ])
    ]),
    dcc.Store(id='red-store', data=[]),
    dcc.Store(id='yellow-store', data=[]),
    dcc.Store(id='camera-store', data={})
], fluid=True)

@app.callback(
    Output('terrain-plot', 'figure'),
    Output('red-store', 'data'),
    Output('yellow-store', 'data'),
    Output('summary-box', 'children'),
    Output('camera-store', 'data'),
    Input('terrain-plot', 'clickData'),
    Input('clear-red', 'n_clicks'),
    Input('clear-yellow', 'n_clicks'),
    State('red-store', 'data'),
    State('yellow-store', 'data'),
    State('camera-store', 'data'),
    State('terrain-plot', 'relayoutData'),
    prevent_initial_call=True
)
def update_figure(clickData, clear_red, clear_yellow, red_markers, yellow_markers, camera_data, relayout_data):
    ctx = dash.callback_context
    trigger = ctx.triggered[0]["prop_id"].split(".")[0]

    if relayout_data and "scene.camera" in relayout_data:
        camera_data = relayout_data["scene.camera"]

    if trigger == "clear-red":
        return create_3d_figure([], yellow_markers, camera=camera_data), [], yellow_markers, "", camera_data

    if trigger == "clear-yellow":
        follow_path = None
        summary = ""
        if len(red_markers) == 2:
            (x1, y1), (x2, y2) = red_markers
            dz = abs(Z[y2, x2] - Z[y1, x1]) * 50
            dx = (x2 - x1) * grid_dx_km
            dy = (y2 - y1) * grid_dy_km
            d3d = np.sqrt(dx**2 + dy**2 + (dz / 1000)**2)
            follow_path = interpolate_path((x1, y1), (x2, y2))
            summary = f"3D Distance: {d3d:.2f} km | Elevation Δ: {dz:.2f} m"

        return create_3d_figure(red_markers, [], follow_path, camera=camera_data), red_markers, [], summary, camera_data


    if clickData:
        x = clickData["points"][0]["x"]
        y = clickData["points"][0]["y"]
        gx = int(np.round(x * (cols - 1)))
        gy = int(np.round(y * (rows - 1)))

        if len(red_markers) < 2:
            red_markers.append((gx, gy))
        else:
            yellow_markers.append((gx, gy))

    summary = ""
    follow_path = None
    if len(red_markers) == 2:
        (x1, y1), (x2, y2) = red_markers
        dz = abs(Z[y2, x2] - Z[y1, x1]) * 50
        dx = (x2 - x1) * grid_dx_km
        dy = (y2 - y1) * grid_dy_km
        d3d = np.sqrt(dx**2 + dy**2 + (dz / 1000)**2)
        follow_path = interpolate_path((x1, y1), (x2, y2))
        summary = f"3D Distance: {d3d:.2f} km | Elevation Δ: {dz:.2f} m"

    fig = create_3d_figure(red_markers, yellow_markers, follow_path, camera=camera_data)
    return fig, red_markers, yellow_markers, summary, camera_data

if __name__ == "__main__":
    app.run(debug=False)
