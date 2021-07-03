const { response } = require("express");
var express = require("express");
var adminHelpers = require("../helpers/admin-helpers");
var router = express.Router();
var productHelpers = require("../helpers/product-helpers");
const userHelpers = require("../helpers/user-helpers");
const Admin = true;
const verifylogin = (req, res, next) => {
  if (req.session.adminLoggedIn) {
    next();
  } else {
    res.redirect("/admin");
  }
};

/* GET users listing. */
router.get("/", function (req, res, next) {
  res.render("admin/login", { noHeader: true, admin: req.session.admin });
});

router.post("/adminLogin", (req, res) => {
  adminHelpers.adminLogin(req.body).then((response) => {
    if (response.status) {
      req.session.admin = response.admin;
      req.session.adminLoggedIn = true;
      res.redirect("view-products");
    } else {
      req.session.adminLoginErr = "Invalid username or password";
      res.redirect("/admin");
    }
  });
});

router.get("/adminLogout", (req, res) => {
  req.session.admin = null;
  req.session.adminLoggedIn = false;
  res.redirect("/admin");
});

// router.post('/adminSignup', (req, res) => {
//   console.log(req.body)
//   adminHelpers.adminSignUp(req.body).then((response) => {
//     console.log(response)
//     req.session.admin = response
//     req.session.adminLoggedIn = true
//     res.redirect('/view-products')
//   })
// })

router.get("/view-products", verifylogin, (req, res) => {
  productHelpers.getAllProducts().then((products) => {
    res.render("admin/view-products", {
      Admin,
      products,
      admin: req.session.admin,
    });
  });
});

router.get("/add-product", verifylogin, function (req, res) {
  res.render("admin/add-product", { Admin, admin: req.session.admin });
});

router.post("/add-product", (req, res) => {
  console.log(req.body);
  console.log(req.files.image);

  productHelpers.addProduct(req.body, (id) => {
    let image = req.files.image;
    console.log(id);
    image.mv("./public/product-images/" + id + ".jpg", (err, done) => {
      if (!err) {
        res.render("admin/add-product", { Admin, admin: req.session.admin });
      } else {
        console.log(err);
      }
    });
  });
});
router.get("/delete-product/:id", verifylogin, (req, res) => {
  let proId = req.params.id;
  productHelpers.deleteProduct(proId).then((response) => {
    res.redirect("/admin/view-products");
  });
});
router.get("/edit-product/:id", verifylogin, async (req, res) => {
  let product = await productHelpers.getProductDetails(req.params.id);
  console.log(product);
  res.render("admin/edit-product", {
    product,
    Admin,
    admin: req.session.admin,
  });
});
router.post("/edit-product/:id", (req, res) => {
  let id = req.params.id;
  productHelpers.updateProduct(req.params.id, req.body).then(() => {
    res.redirect("/admin");
    if (req.files.Image) {
      let image = req.files.Image;
      image.mv("./public/product-images/" + id + ".jpg");
    }
  });
});
router.get("/all-users", verifylogin, (req, res) => {
  userHelpers.getAllUsers().then((users) => {
    res.render("admin/all-users", { Admin, admin: req.session.admin, users });
  });
});

router.post("/delete-user", verifylogin, (req, res) => {
  userHelpers.deleteUsers(req.body).then((response) => {
    res.json(response);
  });
});

router.get("/all-orders", verifylogin, async (req, res) => {
  let orders = await adminHelpers.getUserOrders();
  res.render("admin/all-orders", { Admin, admin: req.session.admin, orders });
});

router.get("/order-products/:id",verifylogin, async (req, res) => {
  let products = await adminHelpers.getOrderProduct(req.params.id);
  res.render("admin/order-products", {
    Admin,
    admin: req.session.admin,
    products,
  });
});

router.get("/order-details/:id",verifylogin, (req, res) => {
  adminHelpers.getOrderDetails(req.params.id).then((order)=>{
    console.log(order);
    res.render("admin/order-details",{Admin , admin:req.session.admin ,order})
  })
});

// router.get('/delete-user/:id', verifylogin, (req, res) => {
//   let userId = req.params.id
//   userHelpers.deleteUser(userId).then((response) => {
//     res.redirect('/admin/all-users')
//   })
// })

///router.get('/adminLogin', (req, res) => {
//  if (req.session.admin) {
//    res.redirect('/')
//  } else {
//    res.render('admin/login', { "loginErr": req.session.userLoginErr })
//    req.session.adminLoginErr = false
//  }
//})

module.exports = router;
