import torch
import torch.nn as nn
import numpy as np
from preprocessing import Z

rows, cols = Z.shape

def compute_slope(Z):
    dzdx = np.gradient(Z, axis=1)
    dzdy = np.gradient(Z, axis=0)
    return np.sqrt(dzdx**2 + dzdy**2)

slope = compute_slope(Z)


samples = []
for y in range(rows):
    for x in range(cols):
        elev = Z[y, x]
        slp = slope[y, x]
        dist = np.linalg.norm(np.array([rows-1, cols-1]) - np.array([y, x])) / max(rows, cols)
        cost = 0.2 * elev + 0.7 * slp + 0.1 * dist  # Composite cost (can be reweighted)
        samples.append(([x / cols, y / rows, elev, slp, dist], cost))

X_data = torch.tensor([s[0] for s in samples], dtype=torch.float32)
y_data = torch.tensor([s[1] for s in samples], dtype=torch.float32).view(-1, 1)

class CostModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.fc = nn.Sequential(
            nn.Linear(5, 32),
            nn.ReLU(),
            nn.Linear(32, 1)
        )

    def forward(self, x):
        return self.fc(x)

model = CostModel()
loss_fn = nn.MSELoss()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)

for epoch in range(200):
    optimizer.zero_grad()
    pred = model(X_data)
    loss = loss_fn(pred, y_data)
    loss.backward()
    optimizer.step()

torch.save(model.state_dict(), "cost_model.pt")
print("Model trained and saved as cost_model.pt")
