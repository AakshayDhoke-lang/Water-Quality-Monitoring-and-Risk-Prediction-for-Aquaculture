import os
import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, models, transforms
from torch.utils.data import DataLoader

def train_model():
    data_dir = '../Dataset/Freshwater Fish Disease Aquaculture in south asia/Train'
    
    # Transformations for MobileNetV2
    data_transforms = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])

    image_dataset = datasets.ImageFolder(data_dir, data_transforms)
    dataloader = DataLoader(image_dataset, batch_size=32, shuffle=True)

    class_names = image_dataset.classes
    print(f"Classes found: {class_names}")

    # Load MobileNetV2
    model = models.mobilenet_v2(weights=models.MobileNet_V2_Weights.IMAGENET1K_V1)
    
    # Replace the last layer
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, len(class_names))

    device = torch.device("cuda:0" if torch.cuda.is_available() else "cpu")
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=0.001)

    print(f"Starting training on {device}...")
    # Train for just 1 epoch for demonstration/time constraints,
    # In a real environment, you'd train for 10-20 epochs for >85% accuracy.
    num_epochs = 1
    model.train()
    for epoch in range(num_epochs):
        running_loss = 0.0
        running_corrects = 0
        
        for inputs, labels in dataloader:
            inputs = inputs.to(device)
            labels = labels.to(device)

            optimizer.zero_grad()

            outputs = model(inputs)
            _, preds = torch.max(outputs, 1)
            loss = criterion(outputs, labels)

            loss.backward()
            optimizer.step()

            running_loss += loss.item() * inputs.size(0)
            running_corrects += torch.sum(preds == labels.data)

        epoch_loss = running_loss / len(image_dataset)
        epoch_acc = running_corrects.double() / len(image_dataset)

        print(f'Epoch {epoch}/{num_epochs - 1} Loss: {epoch_loss:.4f} Acc: {epoch_acc:.4f}')

    # Save model and classes
    torch.save(model.state_dict(), 'fish_disease_model.pth')
    
    with open('classes.txt', 'w') as f:
        for c in class_names:
            f.write(c + '\n')
            
    print("Model saved to fish_disease_model.pth")

if __name__ == '__main__':
    train_model()
