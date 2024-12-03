const fs = require('fs');
const path = require('path');
const { classifyImage } = require('./services/tensorflow.service');

(async () => {
    try {
        // Load a sample image
        const imagePath = path.join(__dirname, 'test_images', '1200px-Human_eye_with_blood_vessels.jpg'); // Replace with an actual test image path
        const imageBuffer = fs.readFileSync(imagePath);

        // Classify the image
        const result = await classifyImage(imageBuffer);
        console.log('Classification result:', result);

        // Example of mapping indices to labels (imagenet_classes.json)
        const labels = require('./services/imagenet_class_index.json'); // Ensure you have a label mapping file
        
        console.log('Predicted label:', labels[result]);
    } catch (error) {
        console.error('Error testing MobileNet:', error);
    }
})();