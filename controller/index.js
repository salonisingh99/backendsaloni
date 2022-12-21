const express = require('express');
const cors = require('cors');
const route = express.Router();
const User = require('../model/register');
const Request = require('../model/request');
const { Router } = require('express');

route.post("/register", async (req, res) => {
  var { username, password, email, role } = req.body;
  try {
    const oldUser = await User.findOne({ email });
    if (oldUser) {
      res.send({ status: 400, message: "User Exists" });
    } else {
      const user = await User.create({
        username,
        email,
        password,
        role
      });
      if (user) {
        res.send({ status: 200, message: "User register successfully" });
      }
    }
  } catch (error) {
    res.send({ status: 400, message: "Something went wrong!" });
  }
});

route.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email, role });
  //console.log(user)
  if (!user) {
    res.send({ status: 400, message: "User Not found" });
  } else {
    if (password == user.password) {
      res.send({ status: 200, data: user });
    }
    res.send({ status: 400, message: "Invalid Password" });
  }
});

route.post("/profile", async (req, res) => {
  const { phone, college, company, designation, batch } = req.body;
  const _id = req.body._id,profile="Completed"
  User.findByIdAndUpdate(_id, { phone, college, company, designation, batch, profile},
    function (err, docs) {
      if (err) {
        res.send({ status: 400, message: "Profile not updated." });
      }
      else {
        res.send({ status: 200, data: docs });
      }
    });
});

route.get("/getAlumini", async (req, res) => {
  const _ids = req.query.id;
  let userData = {
    role: { $ne: "Student" }
  }
  const users = await Request.aggregate([
    {
      $match: {
        sendBy: _ids, status: { $in: ["Pending", "Connected"] }
      },
    },
    {
      $group: { _id: 0, sendTo: 0, sendTo: { $addToSet: "$sendTo" } },
    },
  ])
  if (users?.length > 0) {
    userData = {
      _id: { $nin: users[0].sendTo }, role: { $ne: "Student" }
    }
  }

  User.find(userData,
    function (err, docs) {
      if (err) {
        res.send({ status: 400, message: "No alunini found." });
      }
      else {
        res.send({ status: 200, data: docs });
      }
    });
});

route.post("/sendRequestToAlumini", async (req, res) => {
  const { sendBy, sendTo, status } = req.body;
  const user = await Request.create({
    sendBy, sendTo, status: status || "Pending"
  });
  if (user) {
    res.send({ status: 200, message: "Request sent successfully" });
  }
});
route.get("/getRequest", async (req, res) => {
  const _ids = req.query.id;
  let userData = {
    role: { $ne: "Alumini" }
  }
  const existUser = await Request.aggregate([{
    $match: {
      sendTo: _ids, status: { $eq: "Connected" }
    },
  },
  {
    $group: { _id: 0, sendBy: 0, sendBy: { $addToSet: "$sendBy" } },
  }])

  if (existUser.length>0) {
    userData = {
      _id: { $nin: existUser[0].sendBy }, role: { $ne: "Alumini" }
    }
  
  }
 
  User.find(userData,
    function (err, docs) {
      if (err) {
        res.send({ status: 400, message: "No request found." });
      }
      else {
        res.send({ status: 200, data: docs });
      }
    });
});
route.put("/requestAcceptOrDelete", async (req, res) => {
  const { sendBy, sendTo, status } = req.body;
  if (status == "Reject") {
    const data = await Request.deleteOne({ sendBy, sendTo })
    //console.log('deleted', data)
    if (data) {
      res.send({ status: 200, message: "Request rejected successfully!" })
    }
  }
  if (status == "Accept") {
    const data = await Request.aggregate([
      {
        $match: {
          sendBy: sendBy, sendTo: sendTo, status: { $in: ["Pending"] }
        },
      }
    ])

    if (data?.[0]) {
      const reqUpdated = await Request.updateOne(
        { sendBy, sendTo, status: "Pending" },     // Query parameter
        { $set: { status: "Connected" } } // Update document
      )
      res.send({ status: 200, message: "Request accepted successfully" })
    }
  }
})

route.get("/connectedAlumini", async (req, res) => {
  const { sendBy } = req.query;
  const alumini = await Request.aggregate([
    {
      $match: {
        sendBy: sendBy, status: { $eq: "Connected" }
      },
    },
    {
      $group: { _id: 0, sendTo: 0, sendTo: { $addToSet: "$sendTo" } },
    },
  ])

  if (alumini?.length > 0) {
    const userData = {
      _id: { $in: alumini[0].sendTo }, role: { $ne: "Student" }
    }

    User.find(userData,
      function (err, docs) {
        if (err) {
          res.send({ status: 400, message: "Something went wrong." });
        }
        else {
          res.send({ status: 200, data: docs });
        }
      });
  } else {
    res.send({ status: 200, data: [] });
  }
});

route.get("/connectedStudent", async (req, res) => {
  const { sendTo } = req.query;
  const alumini = await Request.aggregate([
    {
      $match: {
        sendTo: sendTo, status: { $eq: "Connected" }
      },
    },
    {
      $group: { _id: 0, sendBy: 0, sendBy: { $addToSet: "$sendBy" } },
    },
  ])

  if (alumini?.length > 0) {
    const userData = {
      _id: { $in: alumini[0].sendBy }, role: { $ne: "Alumini" }
    }
    User.find(userData,
      function (err, docs) {
        //console.log(err)
        if (err) {
          res.send({ status: 400, message: "Something went wrong." });
        }
        else {
          res.send({ status: 200, data: docs });
        }
      });
  } else {
    res.send({ status: 200, data: [] });
  }
});
module.exports = route;