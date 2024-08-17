import Client from '../models/client.js';

// Function to create a ew client


export const createClient = async (req, res) => {
    console.log("Request Body:", req.body); // Log the request body for debugging
    try {
        const client = new Client(req.body);
        await client.save();
        res.status(201).send(client);
    } catch (error) {
        console.error("Error creating client:", error);
        res.status(400).send({
            message: "Error creating client",
            error: error.message || error
        });
    }
};


// Function to get all clients
export const getAllClients = async (req, res) => {
    try {
        const clients = await Client.find();
        res.status(200).send(clients);
    } catch (error) {
        res.status(500).send(error);
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
        res.status(500).send(error);
    }
};

// Get a client by name
export const getClientByName = async (req, res) => {
    try {
        const client = await Client.findOne({ name: req.params.name });
        if (!client) {
            return res.status(404).send();
        }
        res.status(200).send(client);
    } catch (error) {
        res.status(500).send(error);
    }
};

// Function to update a client by ID
export const updateClientById = async (req, res) => {
    try {
        const client = await Client.findOneAndUpdate({ _id: req.params.id }, req.body, { new: true, runValidators: true });
        if (!client) {
            return res.status(404).send();
        }
        res.status(200).send(client);
    } catch (error) {
        res.status(400).send(error);
    }
};


// Function to delete a client by ID
export const deleteClientById = async (req, res) => {
    try {
        const client = await Client.findByIdAndDelete(req.params.id);
        if (!client) {
            return res.status(404).send();
        }
        res.status(200).send(client);
    } catch (error) {
        res.status(500).send(error);
    }
};
export default {
    createClient,
    getAllClients,
    getClientById,
    getClientByName,
    updateClientById,
    deleteClientById
};