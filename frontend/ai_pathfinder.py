import torch
import heapq
import numpy as np

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
model.load_state_dict(torch.load("cost_model.pt", map_location=torch.device("cpu")))
model.eval()

def compute_slope(Z):
    dzdx = np.gradient(Z, axis=1)
    dzdy = np.gradient(Z, axis=0)
    return np.sqrt(dzdx**2 + dzdy**2)

def predict_cost(x, y, gx, gy, Z, slope):
    elev = Z[y, x]
    slp = slope[y, x]
    dist = np.linalg.norm([gx - x, gy - y])
    input_tensor = torch.tensor([[x, y, elev, slp, dist]], dtype=torch.float32)
    with torch.no_grad():
        cost = model(input_tensor).item()
    return cost

def ai_a_star(start, goal, Z):
    rows, cols = Z.shape
    slope = compute_slope(Z)

    open_set = [(0, start)]
    came_from = {}
    cost_so_far = {start: 0}

    while open_set:
        _, current = heapq.heappop(open_set)
        if current == goal:
            break

        x, y = current
        for dx in [-1, 0, 1]:
            for dy in [-1, 0, 1]:
                if dx == 0 and dy == 0:
                    continue
                nx, ny = x + dx, y + dy
                if not (0 <= nx < cols and 0 <= ny < rows):
                    continue
                neighbor = (nx, ny)
                new_cost = cost_so_far[current] + predict_cost(nx, ny, *goal, Z, slope)
                if new_cost < cost_so_far.get(neighbor, float('inf')):
                    came_from[neighbor] = current
                    cost_so_far[neighbor] = new_cost
                    priority = new_cost
                    heapq.heappush(open_set, (priority, neighbor))

    # Reconstruct path
    path = []
    node = goal
    while node != start:
        path.append(node)
        node = came_from.get(node)
        if node is None:
            return [], []
    path.append(start)
    path.reverse()
    xs, ys = zip(*path)
    return xs, ys
