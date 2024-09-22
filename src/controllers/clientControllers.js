import cron from "node-cron"
import Client from '../models/client.js';
import group from '../models/group.js';
import {createNotification} from './notificationsControllers.js';


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
export const getAllClients = async (req, res, next) => {
    try {

        if (req.isAuthenticated()) {
            const clients = await Client.find().sort({priorityCli: 1});
            const groups = await group.find();

            console.log(clients);
            res.status(200).render("clients-management.ejs", {clients: clients, groups: groups, userName: req.session.passport.user.userName});
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
            const client = await Client.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });

            const sessionName = req.session.passport.user.userName;        
            await createNotification(sessionName, `${client.name} تم تحديث العميل` , `${sessionName} :تم تحديث العميل من قبل المستخدم`)

            res.status(200).json({message: "operation successeful"})
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error);
        res.status(400).send("Error: Something went wrong.")
    }
};

// Function to delete a client by ID
export const deleteClientById = async (req, res) => {
    try {
        if (req.isAuthenticated()) {
            const client = await Client.findByIdAndDelete(req.params.id);

            // Send a notification about the deletion
            const sessionName = req.session.passport.user.userName;        
            await createNotification(sessionName, `${client.name} تم حذف العميل` , `${sessionName} :تم حذف العميل من قبل المستخدم`)


            res.status(200).json({alertMessage: `تم حذف العميل`});
        } else {
            res.redirect("/login")
        }
        } catch (error) {
        res.status(500).send(error.message);
    }
};


export const SearchClient = async (req, res) => {
    const clientName = req.body.clientName;

    const query = await Client.findOne({name: clientName});
    const allClients = await Client.find();

    const client = [];
    client.push(query);


    const result = client.map(client => {
        let balance = client.totalDebt - client.totalCredit;
        let newBalance = 0;
        if ( balance < 0) {
            newBalance = balance;
            balance = 0;
        }


        return {
            _id: client._id,
            name: client.name,
            totalDebt: +client.totalDebt.toFixed(3),
            totalCredit: +client.totalCredit.toFixed(3),
            balanceDebt: +balance.toFixed(3),
            balanceCredit: +newBalance.toFixed(3),
        }
    })

    let total = {
        DebtOnUs: 0,
        CreditOnUs: 0,
        balanceDebt: 0,
        balanceCredit: 0,
        diff: 0,
    };
    
    result.forEach(client => {
        total.DebtOnUs += +client.totalDebt.toFixed(3);
        total.CreditOnUs += +client.totalCredit.toFixed(3);
        total.balanceDebt += +client.balanceDebt;
        total.balanceCredit += +client.balanceCredit;
    });
    

    total.balanceDebt = +total.balanceDebt.toFixed(3);
    total.balanceCredit = +total.balanceCredit.toFixed(3);



    total.diff =  +total.balanceDebt.toFixed(2) - +total.balanceCredit.toFixed(2);
    total.diff = +total.diff.toFixed(3)


    res.render('financial-management/general-budget.ejs', {clients: result ,total: total, result: allClients})
}





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
            await group.findByIdAndDelete(req.params.id);

            const sessionName = req.session.passport.user.userName;        
            await createNotification(sessionName, `${group.name} تم حذف المجموعة` , `${sessionName} :تم حذف المجموعة من قبل المستخدم`)

            res.status(200).json({alertMessage: 'تم حذف المجموعة'});
        } else {
            res.redirect("/login")
        }
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Error: something went wrong");
    }
}



cron.schedule('0 0 0 * * *', async () => {
    try {
        // Update all clients' totalDebt and totalCredit to zero
        const dailyEarnings = await Client.findOne({name: 'ارباح و الخسائر يومية'});
        dailyEarnings.totalCredit = 0;
        dailyEarnings.totalDebt = 0;
        await dailyEarnings.save();
        console.log('daily earnings data reset to zero');
    } catch (error) {
        console.error('Error resetting client data:', error);
    }
});





export default {
    createClient,
    getAllClients,
    getClientById,
    updateClientById,
    deleteClientById,
    createGroup,
    getAllGroups,
    deleteGroupById,
    SearchClient
};