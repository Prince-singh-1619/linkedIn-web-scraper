const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
// const {profileInfo} = require('./popup.js').default;

// const profileInfo = JSON.parse(localStorage.getItem('profileInfo'));
// console.log("Inside db.js file \n", profileInfo)

const app = express();
const port = 3000;

mongoose.connect('mongodb+srv://serverdb:aWtJoV4xzlwHWPpb@cluster0.vzwharz.mongodb.net/', 
    { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Could not connect to MongoDB', err));

//defining the schema
// const mongoose = require('mongoose')
const personSchema = new mongoose.Schema({
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    companyName: { type: String, default: '' },
    position: { type: String, default: '' },
    location: { type: String, default: '' },
    email: { type: String, default: '' }
});
const Person = mongoose.model('Person', personSchema);

app.use(bodyParser.json());

app.post('/people', async (req, res) => {
    
    const profileInfo = req.body;
    const firstName = profileInfo.first_name;
    const lastName = profileInfo.last_name;
    const companyName = profileInfo.currentCompany;
    const email = profileInfo.companyEmail;
    const position = "";
    const location = "";

    console.log(firstName, lastName, companyName, email);

    const person = new Person({
        position,
        location,
        companyName,
        lastName,
        firstName,
        email
    });

    try {
        const savedPerson = await person.save();
        res.status(201).json(savedPerson);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
