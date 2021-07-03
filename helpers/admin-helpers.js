var db = require("../config/connection");
var collection = require("../config/collections");
var objectId = require("mongodb").ObjectID;
const bcrypt = require("bcrypt");
const { resolve, reject } = require("promise");

module.exports = {
  // adminSignUp: (adminData) => {
  //     console.log(adminData);
  //     return new Promise(async (resolve, reject) => {
  //         adminData.Password = await bcrypt.hash(adminData.Password, 10)
  //         db.get().collection('admin').insertOne(adminData).then((data) => {
  //             resolve(data.ops[0])
  //         })
  //     })

  // }
  adminLogin: (adminData) => {
    return new Promise(async (resolve, reject) => {
      let loginStatus = false;
      let response = {};
      let admin = await db
        .get()
        .collection(collection.ADMIN_COLLECTION)
        .findOne({ Id: adminData.Id });
      if (admin) {
        bcrypt.compare(adminData.Password, admin.Password).then((status) => {
          if (status) {
            console.log("login success");
            response.admin = admin;
            response.status = true;
            resolve(response);
          } else {
            console.log("login failed");
            resolve({ status: false });
          }
        });
      } else {
        console.log("user not found");
        resolve({ status: false });
      }
    });
  },
  getUserOrders: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .find()
        .toArray();
      // console.log(orders);
      let len = orders.length;
      // console.log(len);
      for (let i = 0; i < len; i++) {
        let proLen = orders[i].products.length;
        for (let j = 0; j < proLen; j++) {
          // console.log(orders[i].products[j].item);
          let proId = orders[i].products[j].item;
          orders[i].products[j].details = await db
            .get()
            .collection(collection.PRODUCT_COLLECTION)
            .findOne({ _id: objectId(proId) });
        }
      }
      // console.log(orders[0].products[0]);
      resolve(orders);
    });
  },
  getOrderProduct: (proId) => {
    return new Promise(async (resolve, reject) => {
      let product = await db
        .get()
        .collection(collection.PRODUCT_COLLECTION)
        .find({ _id: objectId(proId) })
        .toArray();
      resolve(product);
    });
  },
  getOrderDetails: (orderId) => {
    return new Promise(async (resolve, reject) => {
      let order = await db
        .get()
        .collection(collection.ORDER_COLLECTION)
        .findOne({ _id: objectId(orderId) })
      order.user = await db.get().collection(collection.USER_COLLECTION).findOne({_id : order.userId},{ projection: { _id: 0, Name: 1, Email: 1 }} )
      console.log(order);
        resolve(order)
    });
  },
};
