const tf = require('@tensorflow/tfjs-node');
const labels = require('./imagenet_classes.json'); // Pre-downloaded labels file

let model;

const loadModel = async () => {
    try {
        if (!model) {
            model = await tf.loadGraphModel('https://tfhub.dev/google/imagenet/mobilenet_v2_100_224/classification/5', {fromTFHub: true});
            console.log('MobileNet model loaded');
        }
        return model;
    } catch (error) {
        console.error('Error loading model:', error);
        throw new Error('Failed to load MobileNet model');
    }
};

const classifyImage = async (imageBuffer) => {
    try {
        await loadModel();

        return tf.tidy(() => {
            const tensor = tf.node.decodeImage(imageBuffer)
                .resizeNearestNeighbor([224, 224])
                .toFloat()
                .expandDims()
                .div(127.5)
                .sub(1);

            const predictions = model.predict(tensor);
            const topPrediction = predictions.argMax(-1).dataSync()[0];

            return {
                label: labels[topPrediction] || 'Unknown',
                index: topPrediction,
            };
        });
    } catch (error) {
        console.error('Error classifying image:', error);
        throw new Error('Failed to classify image');
    }
};

module.exports = { classifyImage };