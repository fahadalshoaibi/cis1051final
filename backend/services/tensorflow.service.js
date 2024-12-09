const tf = require('@tensorflow/tfjs-node');
const cocoSsd = require('@tensorflow-models/coco-ssd');

const labels = Object.keys(require('./imagenet_class_index.json')).reduce((acc, key) => {
    acc[key] = require('./imagenet_class_index.json')[key][1]; // Extract the label (2nd element of the array)
    return acc;
}, {});

let model;
let cocoModel;

// Load Coco SSD Model
const loadCocoSsd = async () => {
    if (!cocoModel) {
        console.log('Loading Coco SSD model...');
        cocoModel = await cocoSsd.load();
        console.log('Coco SSD model loaded.');
    }
    return cocoModel;
};

// Object Detection
const detectObjects = async (imageBuffer) => {
    if (!imageBuffer) {
        throw new Error('No image buffer provided for object detection');
    }

    const cocoModel = await loadCocoSsd();
    const imageTensor = tf.node.decodeImage(imageBuffer);
    const predictions = await cocoModel.detect(imageTensor);

    imageTensor.dispose();
    console.log('Object detection predictions:', predictions);

    return predictions.map(prediction => ({
        bbox: prediction.bbox,
        class: prediction.class,
        score: prediction.score,
    }));
};

// Load MobileNet Model
const loadModel = async () => {
    if (!model) {
        model = await tf.loadGraphModel('https://www.kaggle.com/models/google/mobilenet-v2/TfJs/100-224-classification/3', { fromTFHub: true });
        console.log('MobileNet model loaded.');
    }
    return model;
};

// Image Preprocessing
const preprocessImage = (imageBuffer) => {
    if (!imageBuffer) {
        throw new Error('Invalid image buffer');
    }

    return tf.tidy(() => {
        const tensor = tf.node.decodeImage(imageBuffer)
            .resizeNearestNeighbor([224, 224]) // Resize for MobileNet
            .toFloat()
            .expandDims() // Add batch dimension
            .div(255); // Normalize
        return tensor;
    });
};

// Image Classification
const classifyImage = async (imageBuffer) => {
    if (!imageBuffer) {
        throw new Error('No image buffer provided for classification');
    }

    const model = await loadModel();
    const preprocessedTensor = preprocessImage(imageBuffer);

    const predictionResult = tf.tidy(() => {
        const predictions = model.predict(preprocessedTensor);
        const topPrediction = predictions.argMax(-1).dataSync()[0];
        const adjustedPrediction = topPrediction - 1; // Adjust offset
        const label = labels[adjustedPrediction] || 'Unknown';

        console.log('Predictions:', predictions.arraySync());
        console.log('Top Prediction Index:', topPrediction);
        console.log('Adjusted Index:', adjustedPrediction);
        console.log('Label:', label);

        return { label, index: adjustedPrediction };
    });

    preprocessedTensor.dispose();
    return predictionResult;
};

module.exports = { detectObjects, classifyImage };