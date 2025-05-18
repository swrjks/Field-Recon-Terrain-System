from flask import Flask, render_template, jsonify, request
import psutil
import subprocess
import platform
import os
import math

# Create Flask app
app = Flask(__name__)

# Import Dash app
from app import app as dash_app  # This is your Dash terrain app (from app.py)
dash_app.title = "3D Terrain"
dash_app.init_app(app)  # Attach Dash to Flask app

# Path to your TIF tiles directory
TIF_DIR = "data/tiffs"  # Change if needed
CURRENT_TIF_FILE = "current_tif.txt"

# Get battery percentage
def get_battery_percent():
    if platform.system() == "Darwin":
        try:
            output = subprocess.check_output(["pmset", "-g", "batt"]).decode()
            for line in output.split("\n"):
                if "%" in line:
                    percent = int(line.split("%")[0].split()[-1])
                    return percent
        except Exception as e:
            print("Battery check failed:", e)
            return 0
    else:
        battery = psutil.sensors_battery()
        return battery.percent if battery else 0

# Find matching TIF filename from coordinates
def get_tif_filename(lat, lon):
    try:
        lat_deg = math.floor(float(lat))
        lon_deg = math.floor(float(lon))
        lat_str = f"n{lat_deg:02d}"
        lon_str = f"e{lon_deg:03d}"
        for file in os.listdir(TIF_DIR):
            if file.startswith(f"{lat_str}_{lon_str}") and file.endswith(".tif"):
                return os.path.join(TIF_DIR, file)
    except Exception as e:
        print("Error matching TIF:", e)
    return None

# Home route (main dashboard)
@app.route('/')
def home():
    return render_template('index.html')

# Navigation route
@app.route('/nav')
def nav():
    lat = request.args.get("lat")
    lon = request.args.get("lon")
    tif_file = None

    if lat and lon:
        tif_file = get_tif_filename(lat, lon)
        if tif_file:
            with open(CURRENT_TIF_FILE, "w") as f:
                f.write(tif_file)
            tif_name = os.path.basename(tif_file)
        else:
            tif_name = "No matching TIF found"
    else:
        tif_name = "None selected"

    return render_template('nav.html', tif_file=tif_name)

# Terrain route (loads Dash)
@app.route('/terrain')
def terrain():
    return dash_app.index()

# System stats API
@app.route('/system')
def system_status():
    net_io = psutil.net_io_counters()
    return jsonify({
        "cpu": psutil.cpu_percent(interval=0.5),
        "memory": psutil.virtual_memory().percent,
        "battery": get_battery_percent(),
        "network": (net_io.bytes_sent + net_io.bytes_recv) / (1024 * 1024)
    })

# Run server
if __name__ == '__main__':
    app.run(debug=True, port=5053)
