const tf = require('@tensorflow/tfjs-node');
const labels = Object.keys(require('./imagenet_class_index.json')).reduce((acc, key) => {
    acc[key] = require('./imagenet_class_index.json')[key][1]; // Extract the label (2nd element of the array)
    return acc;
}, {});


let model;

const loadModel = async () => {
    try {
        if (!model) {
            model = await tf.loadGraphModel('https://www.kaggle.com/models/google/mobilenet-v2/TfJs/100-224-classification/3', {fromTFHub: true});
            console.log('MobileNet model loaded');
        }
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw new Error('Failed to load MobileNet model');
    }
};
const preprocessImage = (imageBuffer) => {
    return tf.tidy(() => {
        const tensor = tf.node.decodeImage(imageBuffer)
            .resizeNearestNeighbor([224, 224]) // Resize to MobileNet input size
            .toFloat()
            .expandDims() // Add batch dimension
            .div(127.5) // Normalize to [-1, 1]
            .sub(1);

        return tensor;
    });
};
const classifyImage = async (imageBuffer) => {
    try {
        await loadModel();

        const preprocessedTensor = preprocessImage(imageBuffer);

        const predictionResult = tf.tidy(() => {
            // Make prediction
            const predictions = model.predict(preprocessedTensor);

            // Extract top prediction index
            const topPrediction = predictions.argMax(-1).dataSync()[0];

            // Return the prediction details
            return {
                label: labels[topPrediction] || 'Unknown',
                index: topPrediction,
            };
        });

        // Explicitly dispose of preprocessedTensor since tf.tidy doesn't manage it
        preprocessedTensor.dispose();

        return predictionResult;
    } catch (error) {
        console.error('Error classifying image:', error);
        throw new Error('Failed to classify image');
    }
};

module.exports = { classifyImage };