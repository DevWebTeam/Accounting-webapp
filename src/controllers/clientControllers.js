import Client from '../models/client.js';
import group from '../models/group.js';
import { checkIfAuthorized } from '../controllers/functions.js';


// Function to create a new client
export const createClient = async (req, res) => {
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).send(client);
    } catch (error) {
        res.status(400).send(error.message);
    }
};

// Function to get all clients
export const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).send(clients);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Function to get a client by ID
export const getClientById = async (req, res) => {
    try {
        const client = await Client.findById(req.params.id);
        if (!client) {
            return res.status(404).send();
        }
        res.status(200).send(client);
    } catch (error) {
        res.status(500).send(error.message);
    }
};

// Function to update a client by ID
export const updateClientById = async (req, res) => {
    try {
        const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!client) {
            return res.status(404).send();
        }
        res.status(200).send(client);
    } catch (error) {
        console.log(error);
        res.status(400).send(error.message);
    }
};

// Function to delete a client by ID
export const deleteClientById = async (req, res) => {
    try {
        await Client.findByIdAndDelete(req.params.id);
        
        res.status(200).redirect("/clients");
    } catch (error) {
        res.status(500).send(error.message);
    }
};

export const createGroup = async (req, res) => {
    try {
        const newgroup = new group(req.body)
        await newgroup.save();
        res.status(201).redirect("/clients/groups")
    } catch (error) {
        res.status(400).send(error.message)
    }
};

export const getAllGroups = async (req, res) => {
    try {
        const groups = await group.find();
        res.status(200).json(groups);
    } catch (error) {
        console.log(error);
        res.status(500).send(error.message);
    }
};

export const deleteGroupById = async (req, res) => {
    try {
        await group.findByIdAndDelete(req.params.id);
        res.status(200).redirect("/clients/groups");
    } catch (error) {
        console.log(error.message);
        res.status(500).send(error.message);
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