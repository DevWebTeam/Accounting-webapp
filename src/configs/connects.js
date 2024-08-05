const mongoose =require('mongoose');

mangoose.connect('mangodb://127.0.0.1:27017/Financify')
.then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('Connection error', err);
});

module.exports= mongoose;