const ProductModel = require("../model/product");


const viewHome=(req,res)=>{
   res.render('User/home',{
      title:"product"
   })
}


const getProductsUser=async(req,res)=>{
   try{
      let product=await ProductModel.find();
      console.log("products",product);
      if(product)
      {
          res.render('User/ViewProductUser',{
              title:"all product",
              data:product
            })
      }
  }catch(err){
      console.log("Data not fetched",err);
  }    
 }

const getSingleProduct=async(req,res)=>{
   try{
      let product_id=req.params.id;
      // console.log("Product id",product_id)
      let single=await ProductModel.findById(product_id)
      // console.log("Collected product by id:",single)
      if(single){
         res.render('User/productDetails',{
            title:"Details",
            data:single
         })
      }      
   }
   catch(err){
       console.log("Product not found",err)
    }
 }

 

module.exports={
   viewHome,
   getProductsUser,
   getSingleProduct
}