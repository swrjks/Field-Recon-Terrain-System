import numpy as np
import plotly.graph_objects as go
from dash import Dash, dcc, html, Output, Input, State
import dash_bootstrap_components as dbc
import dash
from preprocessing import Z, X, Y, interpolate_path, grid_dx_km, grid_dy_km, x_km_total, y_km_total

rows, cols = Z.shape

app = Dash(__name__, external_stylesheets=[dbc.themes.SLATE], assets_folder="assets")
server = app.server

# ─── Color palette (matches reference image) ──────────────────────────────────
C = {
    "bg":        "#04080f",
    "panel":     "#080e18",
    "border":    "#0e2a3a",
    "border_hi": "#0d4a6e",
    "teal":      "#00d4b4",
    "teal_dim":  "#007d6a",
    "teal_glow": "rgba(0,212,180,0.08)",
    "cyan":      "#00c8e8",
    "orange":    "#ff7b2e",
    "red":       "#ff3d5a",
    "yellow":    "#ffe156",
    "text":      "#c8d8e4",
    "text_dim":  "#5a7888",
    "text_hi":   "#ffffff",
    "green":     "#00e580",
    "amber":     "#ffac30",
}

PANEL_STYLE = {
    "background": C["panel"],
    "border": f"1px solid {C['border']}",
    "borderTop": f"2px solid {C['teal_dim']}",
    "borderRadius": "4px",
    "padding": "12px",
    "position": "relative",
    "overflow": "visible",
}

LABEL_STYLE = {
    "fontSize": "9px",
    "letterSpacing": "2px",
    "color": C["teal"],
    "textTransform": "uppercase",
    "fontFamily": "'Courier New', monospace",
    "marginBottom": "4px",
    "opacity": "0.85",
    "whiteSpace": "nowrap",
}

VALUE_STYLE = {
    "fontSize": "22px",
    "fontWeight": "700",
    "color": C["text_hi"],
    "fontFamily": "'Courier New', monospace",
    "lineHeight": "1",
    "marginBottom": "2px",
    "whiteSpace": "nowrap",
    "overflow": "hidden",
    "textOverflow": "ellipsis",
}

UNIT_STYLE = {
    "fontSize": "11px",
    "color": C["teal_dim"],
    "fontFamily": "'Courier New', monospace",
}


# ─── Terrain figure ────────────────────────────────────────────────────────────
def create_3d_figure(red_markers, yellow_markers, follow_path=None, camera=None):
    fig = go.Figure()

    fig.add_trace(go.Surface(
        x=X, y=Y, z=Z * 50,
        colorscale=[
            [0.0, "#05151f"],
            [0.2, "#0a2e3a"],
            [0.4, "#0d4a3a"],
            [0.6, "#0e6e50"],
            [0.8, "#208060"],
            [1.0, "#40aa80"],
        ],
        showscale=False,
        lighting=dict(ambient=0.55, diffuse=0.85, roughness=0.65, specular=0.25),
        contours=dict(
            z=dict(show=True, usecolormap=True, highlightcolor="#00d4b4", project_z=False, width=1)
        )
    ))

    for i, (gx, gy) in enumerate(red_markers):
        fig.add_trace(go.Scatter3d(
            x=[X[gy, gx]], y=[Y[gy, gx]], z=[Z[gy, gx] * 50 + 5],
            mode="markers+text",
            marker=dict(size=9, color=C["red"], symbol='diamond',
                        line=dict(color=C["text_hi"], width=1)),
            text=[f"P{i+1}"], textposition="top center",
            textfont=dict(color=C["text_hi"], size=11)
        ))

    if len(yellow_markers) >= 2:
        path_x, path_y, path_z = [], [], []
        for i in range(len(yellow_markers) - 1):
            (gx1, gy1) = yellow_markers[i]
            (gx2, gy2) = yellow_markers[i + 1]
            interp_gx, interp_gy = interpolate_path((gx1, gy1), (gx2, gy2))
            path_x.extend(X[interp_gy, interp_gx])
            path_y.extend(Y[interp_gy, interp_gx])
            path_z.extend(Z[interp_gy, interp_gx] * 50 + 4)

        fig.add_trace(go.Scatter3d(
            x=path_x, y=path_y, z=path_z,
            mode="lines+markers",
            marker=dict(color=C["yellow"], size=3),
            line=dict(color=C["yellow"], width=3),
            name="Manual Path"
        ))

    if follow_path:
        xs, ys = follow_path
        zs = Z[ys, xs] * 50 + 2
        fig.add_trace(go.Scatter3d(
            x=X[ys, xs], y=Y[ys, xs], z=zs,
            mode="lines",
            line=dict(color=C["teal"], width=5),
            name="AI Path"
        ))

    fig.update_layout(
        paper_bgcolor="rgba(0,0,0,0)",
        plot_bgcolor="rgba(0,0,0,0)",
        margin=dict(l=0, r=0, t=0, b=0),
        scene=dict(
            xaxis=dict(showgrid=True, gridwidth=1, gridcolor="rgba(0,212,180,0.08)",
                       backgroundcolor="rgba(4,8,15,0.9)", showticklabels=False, title=""),
            yaxis=dict(showgrid=True, gridwidth=1, gridcolor="rgba(0,212,180,0.08)",
                       backgroundcolor="rgba(4,8,15,0.9)", showticklabels=False, title=""),
            zaxis=dict(showgrid=True, gridwidth=1, gridcolor="rgba(0,212,180,0.08)",
                       backgroundcolor="rgba(4,8,15,0.9)", showticklabels=False, title=""),
            aspectratio=dict(x=1, y=1, z=0.28),
            bgcolor="rgba(4,8,15,0.95)",
            camera=dict(eye=dict(x=1.5, y=1.5, z=1.3))
        ),
        template="plotly_dark",
        showlegend=False,
    )

    if camera:
        fig.update_layout(scene_camera=camera)

    return fig


# ─── Sparkline mini-chart (for sidebar) ────────────────────────────────────────
def make_sparkline(values, color):
    return go.Figure(
        data=[go.Scatter(
            y=values, mode="lines",
            line=dict(color=color, width=1.5),
            fill="tozeroy",
            fillcolor=f"rgba({','.join(str(int(color.lstrip('#')[i:i+2], 16)) for i in (0,2,4))},0.15)"
            if color.startswith('#') else "rgba(0,212,180,0.12)"
        )],
        layout=go.Layout(
            margin=dict(l=0, r=0, t=0, b=0),
            paper_bgcolor="rgba(0,0,0,0)",
            plot_bgcolor="rgba(0,0,0,0)",
            xaxis=dict(visible=False),
            yaxis=dict(visible=False),
            height=50,
            showlegend=False,
        )
    )


# ─── Helper: panel header ──────────────────────────────────────────────────────
def panel_header(title, subtitle=None):
    return html.Div([
        html.Div([
            html.Span("◆ ", style={"color": C["teal"], "fontSize": "8px"}),
            html.Span(title, style={
                "fontSize": "9px", "letterSpacing": "2px", "color": C["teal"],
                "textTransform": "uppercase", "fontFamily": "'Courier New', monospace",
            }),
        ]),
        html.Div(subtitle, style={
            "fontSize": "10px", "color": C["text_dim"],
            "fontFamily": "'Courier New', monospace",
            "marginTop": "2px",
        }) if subtitle else html.Div(),
        html.Div(style={
            "height": "1px", "background": f"linear-gradient(90deg, {C['teal_dim']}, transparent)",
            "marginTop": "6px", "marginBottom": "8px",
        }),
    ])


# ─── Metric card ───────────────────────────────────────────────────────────────
def metric_card(label, value, unit, badge=None, badge_color=None):
    return html.Div([
        html.Div(label, style=LABEL_STYLE),
        html.Div(value, id=f"metric-{label.replace(' ','_')}", style=VALUE_STYLE),
        html.Div([
            html.Span(unit, style=UNIT_STYLE),
            html.Span(badge, style={
                "fontSize": "9px", "color": badge_color or C["green"],
                "background": f"rgba(0,229,128,0.1)",
                "border": f"1px solid {badge_color or C['green']}",
                "padding": "1px 5px", "borderRadius": "2px",
                "fontFamily": "'Courier New', monospace",
                "marginLeft": "6px",
            }) if badge else html.Span(),
        ], style={"display": "flex", "alignItems": "center"}),
    ], style={**PANEL_STYLE, "flex": "1", "minWidth": "0", "overflow": "hidden"})


# ─── Waypoint table row ────────────────────────────────────────────────────────
def waypoint_row(rank, name, value, pct, bar_color):
    return html.Div([
        html.Span(f"{rank:02d}", style={"color": C["text_dim"], "fontSize": "10px",
                                         "fontFamily": "'Courier New', monospace", "width": "18px"}),
        html.Span(name, style={"color": C["text"], "fontSize": "11px",
                                "flex": "1", "fontFamily": "'Courier New', monospace"}),
        html.Span(f"{value}", style={"color": C["text_hi"], "fontSize": "10px",
                                      "fontFamily": "'Courier New', monospace", "marginRight": "6px"}),
        html.Div(style={
            "width": "50px", "height": "3px", "background": C["border"],
            "borderRadius": "2px", "overflow": "hidden",
        }, children=[html.Div(style={
            "width": f"{pct}%", "height": "100%",
            "background": bar_color, "borderRadius": "2px",
        })]),
    ], style={
        "display": "flex", "alignItems": "center", "gap": "8px",
        "padding": "4px 0", "borderBottom": f"1px solid {C['border']}",
    })


# ─── Layout ────────────────────────────────────────────────────────────────────
app.layout = html.Div([
    # ── Top header bar ──
    html.Div([
        html.Div([
            html.Div("▣", style={"color": C["teal"], "fontSize": "18px", "marginRight": "10px"}),
            html.Div([
                html.Div("TERRAIN NAVIGATOR", style={
                    "fontSize": "13px", "fontWeight": "700", "color": C["text_hi"],
                    "letterSpacing": "3px", "fontFamily": "'Courier New', monospace",
                }),
                html.Div("3D GEOSPATIAL ANALYSIS PLATFORM", style={
                    "fontSize": "8px", "color": C["teal_dim"],
                    "letterSpacing": "2px", "fontFamily": "'Courier New', monospace",
                }),
            ]),
        ], style={"display": "flex", "alignItems": "center"}),

        html.Div([
            html.Div("● SYSTEM ACTIVE", style={
                "fontSize": "9px", "color": C["green"],
                "fontFamily": "'Courier New', monospace", "letterSpacing": "1px",
            }),
            html.Div(id="header-stats", style={
                "fontSize": "9px", "color": C["text_dim"],
                "fontFamily": "'Courier New', monospace", "marginTop": "2px",
            }, children=f"GRID: {cols}×{rows} | SPAN: {x_km_total:.1f}×{y_km_total:.1f} km"),
        ], style={"textAlign": "right"}),
    ], style={
        "display": "flex", "justifyContent": "space-between", "alignItems": "center",
        "background": C["panel"], "borderBottom": f"1px solid {C['border']}",
        "padding": "8px 16px", "height": "48px",
    }),

    # ── Main 3-column layout ──
    html.Div([

        # ── LEFT SIDEBAR ──
        html.Div([

            # Terrain metrics
            html.Div([
                panel_header("TERRAIN METRICS", "Real-time analysis"),
                html.Div([
                    metric_card("Area Coverage", f"{x_km_total * y_km_total:.1f}", "sq km"),
                    metric_card("Grid Span X", f"{x_km_total:.2f}", "km"),
                ], style={"display": "flex", "gap": "8px", "marginBottom": "8px"}),
                html.Div([
                    metric_card("Grid Span Y", f"{y_km_total:.2f}", "km"),
                    metric_card("Grid Resolution", f"{cols}×{rows}", "cells"),
                ], style={"display": "flex", "gap": "8px"}),
            ], style={**PANEL_STYLE, "marginBottom": "8px"}),

            # Path analysis
            html.Div([
                panel_header("PATH ANALYSIS", "Active route data"),
                html.Div(id="path-3d-dist", children=[
                    html.Div("3D DISTANCE", style=LABEL_STYLE),
                    html.Div("—", style={**VALUE_STYLE, "fontSize": "22px"}),
                    html.Div("km", style=UNIT_STYLE),
                ], style={"marginBottom": "10px"}),
                html.Div(id="path-elevation", children=[
                    html.Div("ELEVATION DELTA", style=LABEL_STYLE),
                    html.Div("—", style={**VALUE_STYLE, "fontSize": "22px"}),
                    html.Div("meters", style=UNIT_STYLE),
                ]),
            ], style={**PANEL_STYLE, "marginBottom": "8px"}),

            # Waypoint tracker
            html.Div([
                panel_header("WAYPOINT REGISTRY", "Marked positions"),
                html.Div(id="waypoint-table", children=[
                    html.Div("No waypoints placed", style={
                        "color": C["text_dim"], "fontSize": "10px",
                        "fontFamily": "'Courier New', monospace", "textAlign": "center",
                        "padding": "12px 0",
                    })
                ]),
            ], style={**PANEL_STYLE, "marginBottom": "8px"}),

            # Controls
            html.Div([
                panel_header("CONTROLS"),
                html.Div([
                    html.Button([
                        html.Span("✕ ", style={"color": C["red"]}),
                        "CLEAR MARKERS"
                    ], id="clear-red",
                        style={
                            "background": "rgba(255,61,90,0.08)", "color": C["red"],
                            "border": f"1px solid {C['red']}", "borderRadius": "3px",
                            "padding": "6px 10px", "fontSize": "9px", "letterSpacing": "1px",
                            "cursor": "pointer", "fontFamily": "'Courier New', monospace",
                            "flex": "1",
                        }, className="glow-btn"),
                    html.Button([
                        html.Span("✕ ", style={"color": C["yellow"]}),
                        "CLEAR PATH"
                    ], id="clear-yellow",
                        style={
                            "background": "rgba(255,225,86,0.08)", "color": C["yellow"],
                            "border": f"1px solid {C['yellow']}", "borderRadius": "3px",
                            "padding": "6px 10px", "fontSize": "9px", "letterSpacing": "1px",
                            "cursor": "pointer", "fontFamily": "'Courier New', monospace",
                            "flex": "1",
                        }, className="glow-btn"),
                ], style={"display": "flex", "gap": "8px"}),

                html.Div([
                    html.Div("◈ Click terrain to place markers", style={"color": C["text_dim"], "marginBottom": "2px"}),
                    html.Div("◈ First 2 clicks = route endpoints (red)", style={"color": C["text_dim"], "marginBottom": "2px"}),
                    html.Div("◈ Subsequent clicks = waypoints (yellow)", style={"color": C["text_dim"]}),
                ], style={
                    "fontSize": "9px", "fontFamily": "'Courier New', monospace",
                    "marginTop": "10px", "lineHeight": "1.8",
                }),
            ], style=PANEL_STYLE),

        ], style={
            "width": "270px", "minWidth": "270px",
            "display": "flex", "flexDirection": "column", "gap": "0",
            "padding": "8px", "overflowY": "auto",
        }),
        html.Div([
            # Sub-header
            html.Div([
                html.Div([
                    html.Span("◆ ", style={"color": C["teal"], "fontSize": "9px"}),
                    html.Span("3D TERRAIN VISUALIZATION", style={
                        "fontSize": "9px", "letterSpacing": "2px", "color": C["teal"],
                        "textTransform": "uppercase", "fontFamily": "'Courier New', monospace",
                    }),
                ]),
                html.Div(id="summary-box", style={
                    "fontSize": "10px", "color": C["amber"],
                    "fontFamily": "'Courier New', monospace",
                    "letterSpacing": "1px",
                }),
            ], style={
                "display": "flex", "justifyContent": "space-between", "alignItems": "center",
                "background": C["panel"], "border": f"1px solid {C['border']}",
                "borderTop": f"2px solid {C['teal_dim']}", "borderRadius": "4px 4px 0 0",
                "padding": "6px 12px", "marginBottom": "-1px",
            }),

            # Terrain plot
            html.Div([
                dcc.Graph(
                    id='terrain-plot',
                    style={"height": "100%"},
                    config={"scrollZoom": True, "displayModeBar": True,
                            "modeBarButtonsToRemove": ["toImage"]},
                ),
            ], style={
                "flex": "1", "background": C["bg"],
                "border": f"1px solid {C['border']}", "borderRadius": "0 0 4px 4px",
                "overflow": "hidden",
            }),
        ], style={
            "flex": "1", "display": "flex", "flexDirection": "column",
            "padding": "8px 0", "minWidth": "0",
        }),

        # ── RIGHT SIDEBAR ──
        html.Div([

            # Elevation profile (sparkline)
            html.Div([
                panel_header("ELEVATION PROFILE", "Terrain cross-section"),
                dcc.Graph(
                    id="elevation-chart",
                    figure=make_sparkline(
                        list(Z[rows // 2, :] * 50),
                        C["teal"]
                    ),
                    config={"displayModeBar": False},
                    style={"height": "55px"},
                ),
            ], style={**PANEL_STYLE, "marginBottom": "8px"}),

            # Terrain stats table
            html.Div([
                panel_header("TERRAIN STATISTICS", "Height distribution"),
                *[waypoint_row(
                    i + 1, label, val, pct, color
                ) for i, (label, val, pct, color) in enumerate([
                    ("Max Elev.", f"{int(Z.max()*50)}m", 100, C["red"]),
                    ("Mean Elev.", f"{int(Z.mean()*50)}m", int(Z.mean() / Z.max() * 100), C["amber"]),
                    ("Std Dev", f"{int(Z.std()*50)}m", int(Z.std() / Z.max() * 100), C["teal"]),
                    ("Min Elev.", f"{int(Z.min()*50)}m", max(1, int(Z.min() / Z.max() * 100)), C["cyan"]),
                    ("Coverage", f"{cols*rows}", 85, C["green"]),
                ])],
            ], style={**PANEL_STYLE, "marginBottom": "8px"}),

            # Route comparison (X-section sparklines)
            html.Div([
                panel_header("CROSS-SECTION VIEWS", "Y/X axis profiles"),
                html.Div("Y-AXIS PROFILE", style={**LABEL_STYLE, "marginTop": "0"}),
                dcc.Graph(
                    figure=make_sparkline(list(Z[:, cols // 2] * 50), C["cyan"]),
                    config={"displayModeBar": False},
                    style={"height": "45px"},
                ),
                html.Div("X-AXIS PROFILE", style={**LABEL_STYLE, "marginTop": "6px"}),
                dcc.Graph(
                    figure=make_sparkline(list(Z[rows // 2, :] * 50), C["orange"]),
                    config={"displayModeBar": False},
                    style={"height": "45px"},
                ),
            ], style={**PANEL_STYLE, "marginBottom": "8px"}),

            # Status / legend
            html.Div([
                panel_header("LAYER LEGEND"),
                *[html.Div([
                    html.Div(style={
                        "width": "18px", "height": "3px",
                        "background": color, "borderRadius": "1px",
                    }),
                    html.Span(label, style={
                        "fontSize": "10px", "color": C["text"],
                        "fontFamily": "'Courier New', monospace",
                    }),
                ], style={"display": "flex", "alignItems": "center",
                          "gap": "8px", "marginBottom": "5px"})
                 for label, color in [
                    ("AI Route (orange path)", C["teal"]),
                    ("Manual Waypoints", C["yellow"]),
                    ("Route Endpoints", C["red"]),
                ]],
            ], style=PANEL_STYLE),

        ], style={
            "width": "270px", "minWidth": "270px",
            "display": "flex", "flexDirection": "column", "gap": "0",
            "padding": "8px", "overflowY": "auto",
        }),

    ], style={
        "display": "flex", "flex": "1",
        "height": "calc(100vh - 48px)",
        "overflow": "hidden",
    }),

    dcc.Store(id='red-store', data=[]),
    dcc.Store(id='yellow-store', data=[]),
    dcc.Store(id='camera-store', data={}),

], style={"background": C["bg"], "height": "100vh", "overflow": "hidden"})


# ─── Callback ──────────────────────────────────────────────────────────────────
@app.callback(
    Output('terrain-plot', 'figure'),
    Output('red-store', 'data'),
    Output('yellow-store', 'data'),
    Output('summary-box', 'children'),
    Output('camera-store', 'data'),
    Output('path-3d-dist', 'children'),
    Output('path-elevation', 'children'),
    Output('waypoint-table', 'children'),
    Input('terrain-plot', 'clickData'),
    Input('clear-red', 'n_clicks'),
    Input('clear-yellow', 'n_clicks'),
    State('red-store', 'data'),
    State('yellow-store', 'data'),
    State('camera-store', 'data'),
    State('terrain-plot', 'relayoutData'),
    prevent_initial_call=True
)
def update_figure(clickData, clear_red, clear_yellow,
                  red_markers, yellow_markers, camera_data, relayout_data):
    ctx = dash.callback_context
    trigger = ctx.triggered[0]["prop_id"].split(".")[0]

    if relayout_data and "scene.camera" in relayout_data:
        camera_data = relayout_data["scene.camera"]

    if trigger == "clear-red":
        return (create_3d_figure([], yellow_markers, camera=camera_data),
                [], yellow_markers, "", camera_data,
                _dist_block("—", ""), _elev_block("—", ""), _no_waypoints())

    if trigger == "clear-yellow":
        return (create_3d_figure(red_markers, [], camera=camera_data),
                red_markers, [], "", camera_data,
                _dist_block("—", ""), _elev_block("—", ""), _build_waypoint_table(red_markers, []))

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
    dist_val, elev_val = "—", "—"
    dist_unit, elev_unit = "", ""

    if len(red_markers) == 2:
        (x1, y1), (x2, y2) = red_markers
        dz = abs(Z[y2, x2] - Z[y1, x1]) * 50
        dx = (x2 - x1) * grid_dx_km
        dy = (y2 - y1) * grid_dy_km
        d3d = np.sqrt(dx ** 2 + dy ** 2 + (dz / 1000) ** 2)
        follow_path = interpolate_path((x1, y1), (x2, y2))
        dist_val = f"{d3d:.2f}"
        dist_unit = "km"
        elev_val = f"{dz:.0f}"
        elev_unit = "meters"
        summary = f"◈ ROUTE ACTIVE  ·  3D DIST: {d3d:.2f} km  ·  ELEV Δ: {dz:.0f} m"

    fig = create_3d_figure(red_markers, yellow_markers, follow_path, camera=camera_data)

    return (fig, red_markers, yellow_markers, summary, camera_data,
            _dist_block(dist_val, dist_unit),
            _elev_block(elev_val, elev_unit),
            _build_waypoint_table(red_markers, yellow_markers))


# ─── UI sub-builders ───────────────────────────────────────────────────────────
def _dist_block(val, unit):
    return [
        html.Div("3D DISTANCE", style=LABEL_STYLE),
        html.Div(val, style={**VALUE_STYLE, "fontSize": "22px",
                              "color": C["teal"] if val != "—" else C["text_dim"]}),
        html.Div(unit, style=UNIT_STYLE),
    ]


def _elev_block(val, unit):
    return [
        html.Div("ELEVATION DELTA", style=LABEL_STYLE),
        html.Div(val, style={**VALUE_STYLE, "fontSize": "22px",
                              "color": C["amber"] if val != "—" else C["text_dim"]}),
        html.Div(unit, style=UNIT_STYLE),
    ]


def _no_waypoints():
    return html.Div("No waypoints placed", style={
        "color": C["text_dim"], "fontSize": "10px",
        "fontFamily": "'Courier New', monospace", "textAlign": "center",
        "padding": "12px 0",
    })


def _build_waypoint_table(red_markers, yellow_markers):
    if not red_markers and not yellow_markers:
        return _no_waypoints()
    rows_html = []
    for i, (gx, gy) in enumerate(red_markers):
        rows_html.append(waypoint_row(
            i + 1, f"P{i+1} [{gx},{gy}]",
            f"{Z[gy,gx]*50:.0f}m", min(100, int(Z[gy,gx] * 100)), C["red"]
        ))
    for i, (gx, gy) in enumerate(yellow_markers):
        rows_html.append(waypoint_row(
            len(red_markers) + i + 1, f"WP{i+1} [{gx},{gy}]",
            f"{Z[gy,gx]*50:.0f}m", min(100, int(Z[gy,gx] * 100)), C["yellow"]
        ))
    return rows_html


if __name__ == "__main__":
    app.run(debug=False)