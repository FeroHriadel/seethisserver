const shortid = require('shortid');
const User = require('../models/userModel');



//this is here because server is on Heroku and is asleep. It takes ages before it wakes up. This should start waking it up before user gets to signin / spots where server is needed
exports.wakeServerUp = (req, res) => {
    res.send(`Server woke up`);
}


exports.signup = async (req, res) => {
    try {
        if (!req.userEmail) {
            return res.status(500).json({error: `userEmail not received from authCheck`});
        }
        
        const user = await User.findOne({email: req.userEmail});

        if (user) {
            return res.json(user);
        }

        const createdUser = await new User({
            email: req.userEmail,
            username: req.userEmail.split('@')[0]  //changed from: shortid.generate()
        }).save();

        res.json(createdUser);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: `Server error (signup)`})
    }
}



exports.getUser = async (req, res) => {
    try {
        if (!req.userEmail) {
            return res.status(500).json({error: `userEmail not received from authCheck`});
        }

        const user = await User.findOne({email: req.userEmail});

        if (user) {
            return res.json(user);
        }

        res.status(404).json({error: `User not found`});
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getUser)`})
    }
}



exports.getUsers = async (req, res) => {
    try {
        const perPage = 25;
        const pageNumber = req.query.pageNumber ? req.query.pageNumber : 1;
        const role = req.query.role ? {role: req.query.role} : {};
        
        const usersLength = await User.countDocuments({...role});

        const users = await User.find({...role})
            .skip(perPage * (pageNumber - 1))
            .sort([['email', 'asc']]);
        if (!users) {
            return res.status(404).json({error: `User could not be found`});
        }

        res.json({pageNumber, numberOfPages: Math.ceil(usersLength / perPage), users})
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (getUsers)`})
    }
}



exports.toggleUserRole = async (req, res) => {
    try {
        const userId = req.params.userId;
        if (!userId) {
            return res.status(400).json({error: `No userId provided`});
        }

        let user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({error: `User not found`});
        }

        let newRole;
        if (user.role === 'admin') newRole = 'user';
        if (user.role === 'user') newRole = 'admin';

        const updatedUser = await User.findByIdAndUpdate(userId, {role: newRole}, {new: true});
        if (!updatedUser) {
            return res.status(400).json({error: `User could not be updated`});
        }
        
        res.json(updatedUser);
        
    } catch (error) {
        console.log(error);
        res.status(500).json({error: `Server error (toggleUserRole)`})
    }
}