import torch
import heapq
import numpy as np
from preprocessing import Z

model_weights = torch.load("cost_model.pt")

class CostModel(torch.nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = torch.nn.Sequential(
            torch.nn.Linear(5, 32),
            torch.nn.ReLU(),
            torch.nn.Linear(32, 1)
        )
    def forward(self, x):
        return self.fc(x)

model = CostModel()
model.load_state_dict(model_weights)
model.eval()

rows, cols = Z.shape

def compute_slope(Z):
    dzdx = np.gradient(Z, axis=1)
    dzdy = np.gradient(Z, axis=0)
    return np.sqrt(dzdx**2 + dzdy**2)

slope = compute_slope(Z)

def predict_cost(x, y, gx, gy, mode="fastest"):
    elev = Z[y, x]
    slp = slope[y, x]
    dist = np.linalg.norm([gx - x, gy - y]) / max(rows, cols)

    input_vec = torch.tensor([[x / cols, y / rows, elev, slp, dist]], dtype=torch.float32)
    with torch.no_grad():
        base_cost = model(input_vec).item()

    if mode == "safest":
        return base_cost * (1 + slp * 10)
    return base_cost

def get_neighbors(x, y):
    for dx in [-1, 0, 1]:
        for dy in [-1, 0, 1]:
            if dx == 0 and dy == 0:
                continue
            nx, ny = x + dx, y + dy
            if 0 <= nx < cols and 0 <= ny < rows:
                yield nx, ny

def ai_a_star(start, goal, mode="fastest"):
    sx, sy = start
    gx, gy = goal
    open_set = [(0, sx, sy)]
    came_from = {}
    cost_so_far = {(sx, sy): 0}

    while open_set:
        _, x, y = heapq.heappop(open_set)

        if (x, y) == (gx, gy):
            break

        for nx, ny in get_neighbors(x, y):
            cost = predict_cost(nx, ny, gx, gy, mode)
            new_cost = cost_so_far[(x, y)] + cost
            if (nx, ny) not in cost_so_far or new_cost < cost_so_far[(nx, ny)]:
                cost_so_far[(nx, ny)] = new_cost
                priority = new_cost
                heapq.heappush(open_set, (priority, nx, ny))
                came_from[(nx, ny)] = (x, y)

    path = []
    current = (gx, gy)
    while current != (sx, sy):
        path.append(current)
        current = came_from.get(current)
        if current is None:
            return []  # no path found
    path.append((sx, sy))
    return list(reversed(path))
