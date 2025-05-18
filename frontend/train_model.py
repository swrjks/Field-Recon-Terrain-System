# train_model.py
import torch
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

# Generate dummy training data
def generate_data(n=1000):
    X = []
    y = []
    for _ in range(n):
        x, y_ = np.random.randint(0, 100, 2)
        elev = np.random.random()
        slope = np.random.random()
        dist = np.random.random()
        features = [x, y_, elev, slope, dist]
        cost = elev + slope * 5 + dist  # Simulate some dependency
        X.append(features)
        y.append([cost])
    return torch.tensor(X, dtype=torch.float32), torch.tensor(y, dtype=torch.float32)

# Train the model
model = CostModel()
X_train, y_train = generate_data()
optimizer = torch.optim.Adam(model.parameters(), lr=0.01)
loss_fn = torch.nn.MSELoss()

for epoch in range(100):
    pred = model(X_train)
    loss = loss_fn(pred, y_train)
    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

torch.save(model.state_dict(), "cost_model.pt")
print("Saved model as cost_model.pt")
