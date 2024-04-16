const mongoose = require('mongoose');

async function connect() {
    try {
        await mongoose.connect('mongodb+srv://root:123@cluster0.g9jqpaf.mongodb.net/web_project');
        console.log('Connect successfully!!!');
    } catch (error) {
        console.log('connect failed');
    }
}

module.exports = { connect };