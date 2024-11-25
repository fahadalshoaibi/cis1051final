const express = require('express')
const app = express()
const mongoose = require('mongoose');
const Product = require('./models/product.model.js');
const productRoute = require('./routes/product.route.js');
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/products", productRoute)
//get all products

app.use((err, req, res, next) => {
    if (err instanceof multer.MulterError) {
        // A Multer error occurred during the upload
        res.status(400).json({ message: err.message });
    } else if (err) {
        // An unknown error occurred
        res.status(500).json({ message: err.message });
    }
});

app.get('/', (req,res) => {
    res.send("from node")
}
);
//get product by id

app.post('/api/products', async (req,res) => {
   try{
    const product = await Product.create(req.body);
    res.status(200).json(product);
   
   }catch(error){
         res.status(500).json({message: error.message})
    }   
});
//update product by id

//delete product by id

mongoose.connect("mongodb+srv://fahad20032012:smartbird@products.hvj8k.mongodb.net/shop?retryWrites=true&w=majority&appName=products")
    .then(()=> {
        console.log("connected succesfully");
        app.listen(3000, ()=>{
            console.log('server is on port 3000')
        });
    })
    .catch(()=> {
        console.log("connection failed successfully")

    });