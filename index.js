const express = require("express");
const fs = require("fs");
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

const app = express();
app.use(express.json());
var users = [];

const data = fs.readFileSync(`${__dirname}/user_data/users.json`, 'utf-8');
if (/^\s*$/.test(data)) {
    console.log('The file data is blank.');
  } else {
    users = JSON.parse(data);
    // Process the data further if needed
  }
// console.log(JSON.parse(data));
// if(data) {
//     users = JSON.parse(data);
// } 


const getalluser = (req, res) => {
    res.status(200).json({
        status: "Success",
        result: users.length,
        data: {
            users
        }
    })
}

const singnup = async (req, res) => {

    if (!req.body.userid || !req.body.password) {
        return res.status(200).json({
            message: "Missing Field."
        })
    }

    const { userid, password } = req.body;
    const user = users.find((user) => user.userid == userid);
    if (user) {
        return res.status(200).json({
            message: "User already exists."
        })
    }

    const uuid = uuidv4();
    const hashedpassword = await bcrypt.hash(password, 10);
    var username = "";
    if (req.body.username) {
        username = req.body.username;
    }
    const newuser = { ...req.body, uuid: uuid, username: username, password: hashedpassword }
    users.push(newuser);


    fs.writeFile(`${__dirname}/user_data/users.json`, JSON.stringify(users), (err) => {
        if (err) {
            console.log('Something went wrong.');
        } else {
            res.status(200).json({
                returncode: 300,
                message: "Sign up Successful.",
                data: [
                    newuser
                ]
            })
        }
    })
}

const signin = async (req, res) => {
    if (!req.body.userid || !req.body.password) {
        return res.status(200).json({
            message: "Missing Field."
        })
    }
    const { userid, password } = req.body;
    const user = users.find((user) => user.userid == userid);

    if (!user) {
        return res.status(200).json({
            message: "Please check your email and password!"
        })
    } else {
        const isvalidPassword = await bcrypt.compare(password, user.password);

        if (!isvalidPassword) {
            return res.status(200).json({
                message: "Please check your email and password!"
            })
        } else {
            return res.status(200).json({
                message: "Sign in Successful."
            })
        }
    }
}


const updateuser = async (req, res) => {

    if (!req.body.userid || !req.body.currentpassword || !req.body.newpassword) {
        return res.status(200).json({
            message: "Missing Field."
        })
    }

    const { userid, currentpassword, newpassword } = req.body;
    const user = users.find((user) => user.userid == userid);

    if (!user) {
        return res.status(200).json({
            message: "Something went wrong!"
        })
    } else {
        const isvalidPassword = await bcrypt.compare(currentpassword, user.password);

        if (!isvalidPassword) {
            return res.status(200).json({
                message: "Something went wrong!"
            })
        } else {
            var password = await bcrypt.hash(newpassword, 10);
            var username = user.username;
            if (req.body.username) {
                username = req.body.username;
            }
            var updateduser = { ...user, password: password, username: username };
            users[users.indexOf(user)] = updateduser;
            fs.writeFile(`${__dirname}/user_data/users.json`, JSON.stringify(users), (err) => {
                if (err) {
                    console.log('Something went wrong!');
                } else {
                    res.status(200).json({
                        returncode: 300,
                        message: "Updated successfully.",
                        data: [
                            updateduser
                        ]
                    })
                }
            })
        }
    }

}

const deleteuser = async (req, res) => {
    if (!req.body.userid || !req.body.password) {
        return res.status(200).json({
            message: "Missing Field."
        })
    }

    const { userid, password } = req.body;
    const user = users.find((user) => user.userid == userid);

    if (!user) {
        return res.status(200).json({
            message: "Please check your email and password!"
        })
    } else {
        const isvalidPassword = await bcrypt.compare(password, user.password);

        if (!isvalidPassword) {
            return res.status(200).json({
                message: "Please check your email and password!"
            })
        } else {
            users.splice(users.indexOf[user], 1);
            fs.writeFile(`${__dirname}/user_data/users.json`, JSON.stringify(users), (err) => {
                if (err) {
                    console.log('Something went wrong!');
                } else {
                    res.status(200).json({
                        returncode: 300,
                        message: "Deleted successfully.",
                    })
                }
            })
        }
    }
}



app.route('/api/v1/user/getall').get(getalluser);
app.route('/api/v1/user/signup').post(singnup);
app.route('/api/v1/user/signin').post(signin);
app.route('/api/v1/user/update').post(updateuser);
app.route('/api/v1/user/delete').post(deleteuser);


app.listen(3000, () => {
    console.log(`App is listen on port 3000.`)
});

