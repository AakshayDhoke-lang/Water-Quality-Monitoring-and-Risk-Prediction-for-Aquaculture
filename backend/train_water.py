import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
import joblib

def create_mock_data():
    np.random.seed(42)
    n_samples = 1000

    # Normal ranges:
    # pH: 6.5 - 8.5
    # Temp: 20 - 30
    # Turbidity: 0 - 50
    # Oxygen: 5 - 10
    
    # Generate random data
    data = {
        'pH': np.random.uniform(5.0, 9.5, n_samples),
        'temp': np.random.uniform(15.0, 35.0, n_samples),
        'turbidity': np.random.uniform(0.0, 100.0, n_samples),
        'oxygen': np.random.uniform(2.0, 12.0, n_samples),
    }
    
    df = pd.DataFrame(data)
    
    # Simple logic to determine Status
    status = []
    for i in range(n_samples):
        # Count how many parameters are out of normal bounds
        out_of_bounds = 0
        if not (6.5 <= df.loc[i, 'pH'] <= 8.5): out_of_bounds += 1
        if not (20 <= df.loc[i, 'temp'] <= 30): out_of_bounds += 1
        if df.loc[i, 'turbidity'] > 50: out_of_bounds += 1
        if df.loc[i, 'oxygen'] < 5: out_of_bounds += 1
        
        if out_of_bounds == 0:
            status.append('Safe')
        elif out_of_bounds == 1:
            status.append('Moderate')
        else:
            status.append('Dangerous')
            
    df['status'] = status
    return df

def train_model():
    print("Generating mock dataset for Water Quality...")
    df = create_mock_data()
    
    X = df[['pH', 'temp', 'turbidity', 'oxygen']]
    y = df['status']
    
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    print("Training RandomForest model...")
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    acc = model.score(X_test, y_test)
    print(f"Model accuracy on test set: {acc * 100:.2f}%")
    
    joblib.dump(model, 'water_quality_model.joblib')
    print("Model saved to water_quality_model.joblib")

if __name__ == '__main__':
    train_model()
