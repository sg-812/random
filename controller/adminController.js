const ProductModel = require("../model/product");
const fs = require("fs");
const path = require("path");

// view addForm
const addForm = (req, res) => {
  res.render("Admin/addProduct", {
    title: "Add Product",
  });
};

// post value of add product
const postValue = async (req, res) => {
  try {
    //  console.log("Collected value from add product form: ",req.body,req.file);
    console.log("Collected value from add product form: ", req.body, req.files);
    let imgArray = req.files.map((file) => file.filename);
    console.log("Images of product", imgArray);
    const formData = new ProductModel({
      product_name: req.body.p_name.toLowerCase(),
      product_price: req.body.p_price,
      product_company: req.body.p_company.toLowerCase(),
      // product_image:req.file.filename
      product_image: imgArray,
    });
    let saved = await formData.save();
    // console.log(saved,"Saved Product");
    if (saved) {
      console.log("Product is saved");
      res.redirect("/admin/products");
    }
  } catch (err) {
    console.log("Error at collecting product", err);
  }
};

// view all products
const viewProducts = async (req, res) => {
  try {
    let product = await ProductModel.find();
    if (product) {
      res.render("Admin/ViewProductAdmin", {
        title: "all product",
        data: product,
      });
    }
  } catch (err) {
    console.log("Data not fetched", err);
  }
};

//delete specific product
const deleteProduct = async (req, res) => {
  try {
    let product_id = req.params.id;
    //  console.log("Id of the product to be deleted",product_id);
    let deleted = await ProductModel.findOneAndDelete({ _id: product_id });
    console.log("Deleted", deleted);
    if (deleted) {
      deleted.product_image.forEach((file) => {
        // console.log("Unlink",file);
        let filePath=path.join(__dirname, "..", "uploads", "product", file)
        fs.unlinkSync(filePath);
      });
      res.redirect("/admin/products");
    }
  } catch (err) {
    console.log("Error in deletion: ", err);
  }
};

//show edit page with existing data
const viewEditPage = async (req, res) => {
  try {
    let product_id = req.params.id;
    // console.log("Product id",product_id)
    let old = await ProductModel.findById(product_id);
    // console.log("Collected old product by id:", old);
    if (old) {
      res.render("Admin/editProduct", {
        title: "edit product",
        data: old,
      });
    }
  } catch (err) {
    console.log("Product not found", err);
  }
};

//post edited data
const EditPage = async (req, res) => {
  try {
    // console.log("Received new value: ",req.body);
    const prod_id = req.body.p_id;
    const updated_pname = req.body.p_name;
    const updated_price = req.body.p_price;
    const updated_company = req.body.p_company;

    let ProductData = await ProductModel.findById(prod_id);
    console.log("Existing data", ProductData);
    ProductData.product_name = updated_pname;
    ProductData.product_price = updated_price;
    ProductData.product_company = updated_company;

    let saved = await ProductData.save();
    if (saved) {
      console.log("Product is saved");
      res.redirect("/admin/products");
    }
  } catch (err) {
    console.log("Error for edit:", err);
  }
};

//searching specific product according to either product name orr prroduct company
const searchProduct = async (req, res) => {
  try {
    const searchText = req.body.searchText.trim().toLowerCase();
    // console.log("Searching text: ", searchText);
    if (searchText) {
      let result = await ProductModel.find({
        $or: [{ product_name: searchText }, { product_company: searchText }],
      });
      // console.log("Searched product: ",result);
      if (result) {
        res.render("Admin/ViewProductAdmin", {
          title: "Product list",
          data: result,
        });
      }
    } else {
      let product = await ProductModel.fetchData();
      if (product) {
        res.render("Admin/ViewProductAdmin", {
          title: "all product",
          data: product,
        });
      }
    }
  } catch (err) {
    console.log(err);
  }
};

//sort product by price
const sorting = async (req, res) => {
  try {
    let order = req.params.order;
    // console.log(order);
    let product = await ProductModel.find();
    // console.log(product,"All data for sorting");
    let sorted;
    if (order == "asc")
      sorted = product.sort(function (a, b) {
        return a.product_price - b.product_price;
      });
    else
      sorted = product.sort(function (a, b) {
        return b.product_price - a.product_price;
      });
    // console.log(sorted,"After sort");
    if (sorted) {
      res.render("Admin/ViewProductAdmin", {
        title: "all product",
        data: sorted,
      });
    }
  } catch (err) {
    console.log("Error to sort", err);
  }
};

module.exports = {
  addForm,
  postValue,
  viewProducts,
  deleteProduct,
  viewEditPage,
  EditPage,
  searchProduct,
  sorting,
};
