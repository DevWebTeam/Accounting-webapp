import Client from '../models/client.js';
import group from '../models/group.js';
import { checkIfAuthorized } from '../controllers/functions.js';


// Function to create a new client
export const createClient = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const client = new Client(req.body);
            await client.save();
            res.status(201).redirect("/clients");
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Function to get all clients
export const getAllClients = async (req, res) => {
    try {

        if (req.isAuthenticated()) {
            const clients = await Client.find().sort({priorityCli: 1});
            const groups = await group.find();
            res.status(200).render("clients-management.ejs", {clients: clients, groups: groups});
        } else {
            res.redirect("/login");
        }
        
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Function to get a client by ID
export const getClientById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const client = await Client.findById(req.params.id);
            res.status(200).json(client);
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error: something went wrong");
    }
};

// Function to update a client by ID
export const updateClientById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
            res.status(200).json({message: "operation successeful"})
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send("Error: Something went wrong.")
    }
};

// Function to delete a client by ID
export const deleteClientById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            await Client.findByIdAndDelete(req.params.id);
            res.status(200).json({message: "successful operation"});
        } else {
            res.redirect("/login")
        }
        } catch (error) {
        res.status(500).send(error.message);
    }
};






//create group
export const createGroup = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const newgroup = new group(req.body)
            await newgroup.save();
            res.status(201).redirect("/clients")
        } else {
            res.redirect("/login");
        }
    } catch (error) {
        console.log(error.message);
        res.status(400).send("Error: something went wrong")
    }
};


//get all groups
export const getAllGroups = async (req, res, next) => {
    try {
        if (req.isAuthenticated()) {
            const groups = await group.find();
            res.status(200).json(groups);
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error: something went wrong");
    }
};


//delete group
export const deleteGroupById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            console.log(req.params);
            await group.findByIdAndDelete(req.params.id);
            res.status(200).json({message: 'successeful'});
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error: something went wrong");
    }
}





export default {
    createClient,
    getAllClients,
    getClientById,
    updateClientById,
    deleteClientById,
    createGroup,
    getAllGroups,
    deleteGroupById
};