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
      console.log(oldUser)
      res.send({ status:400, message: "User Exists" });
    } else {
      const user = await User.create({
        username,
        email,
        password,
        role
      });
      if (user) {
        res.send({ status:200, message: "User register successfully" });
      }
    }
  } catch (error) {
    res.send({ status:400, message: "Something went wrong!" });
  }
});

route.post("/login", async (req, res) => {
  const { email, password, role } = req.body;
  const user = await User.findOne({ email, role });
  console.log(user)
  if (!user) {
    res.send({ status:400, message: "User Not found" });
  } else {
    if (password == user.password) {
      res.send({ status:200, data: user });
    }
    res.send({ status:400,message: "Invalid Password" });
  }
});

route.post("/profile", async (req, res) => {
  const { phone, college, company, designation, batch } = req.body;
  const _id = req.body._id;
  User.findByIdAndUpdate(_id, { phone, college, company, designation, batch },
    function (err, docs) {
      if (err) {
        res.send({ status:400, message: "Profile not updated." });
      }
      else {
        res.send({ status:200, data: docs });
      }
    });
});

route.get("/getAlumini", async (req, res) => {
  const _ids = req.query.id;
  let userData = {
    _id: { $ne: _ids }, role: { $ne: "Student" }
  }
  const users = await Request.aggregate([
    {
      $match: {
        sendBy: _ids, status: { $ne: "Connected" }
      },
    },
    {
      $group: { _id: 0, sendTo: 0, sendTo: { $addToSet: "$sendTo" } },
    },
  ])

  if (users?.length > 0) {
    userData = {
      _id: { $nin: users[0].sendTo },
    }
  }
  User.find(userData,
    function (err, docs) {
      if (err) {
        res.send({ status:400, message: "No request found." });
      }
      else {
        res.send({ status:200, data: docs });
      }
    });
});

route.post("/sendRequestToAlumini", async (req, res) => {
  const { sendBy, sendTo, status } = req.body;
  const user = await Request.create({
    sendBy, sendTo, status: status || "Pending"
  });
  if (user) {
    res.send({ status:200, message: "Request sent successfully" });
  }
});

route.put("/requestAcceptOrDelete", async (req, res) => {
  const { sendBy, sendTo, status } = req.body;
  if (status == "Reject") {
    const data = await Request.deleteOne({ sendBy, SendTo })
    console.log(data, '----------')
  }
  if (status == "Accept") {
    const data = await Request.findOne(sendBy, sentTo, status === 'pending');
    if (data) {
      res.send({ status:200, message: "Request accepted successfully" })
    }
  }
})

route.get("/connectedAlumini", async (req, res) => {
  const { sendBy } = req.body;
  const follower = await Request.find(
    {
      $match: {
        sendBy: sendBy,
        status: "Connected"
      },
    },
    {
      $group: { _id: 0, sendTo: 0, ids: { $addToSet: "$sendTo" } },
    },
  );
  if (follower) {
    let data = {
      _id: { $in: follower[0].sendTo },
    }
    User.find(data,
      function (err, docs) {
        if (err) {
          res.send({ status:400, message: "Something went wrong." });
        }
        else {
          res.send({ status:200, data: docs.data });
        }
      });
  } else {
    res.send({ status:400, message: "No request found." });
  }
});

module.exports = route;