const Product = require('../models/product.model');

const getProducts = async (req, res) => {
    try{
        const product = await Product.create(req.body);
        res.status(200).json(product);
   
   }catch(error){
         res.status(500).json({message: error.message});
    }   
};
const getProduct = async (req, res) => {
    try{
        const { id } = req.params;
        const product = await Product.findById(id);
        res.status(200).json(product);
    } catch(error){
        res.status(500).json({message: error.message});
    }};
const createProduct = async (req, res) => {
    try{
        const product = await Product.create(req.body);
        res.status(200).json(product);
    } catch(error){
        res.status(500).json({message: error.message});
    }};
    const updateProduct = async (req, res) => {
        try {
            const { id } = req.params;
    
            // Update the product and ensure validators run with `{ runValidators: true }`
            const updatedProduct = await Product.findByIdAndUpdate(id, req.body, { new: true, runValidators: true });
    
            if (!updatedProduct) {
                return res.status(404).json({ message: "Product not found" });
            }
    
            res.status(200).json(updatedProduct);  // Return only the updated product
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    };
const deleteProduct = async (req, res) => {try {
    const { id } = req.params;
    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
        return res.status(404).json({ message: "Product not found" });
    }

    res.status(200).json(deletedProduct);
} catch (error) {
    res.status(500).json({ message: error.message });
}
};

module.exports = {
    getProducts,
    getProduct,
    createProduct,
    updateProduct, 
    deleteProduct

};

