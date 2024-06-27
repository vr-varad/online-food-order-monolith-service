import App from './services/ExpressService'
import DB from './services/DatabaseService'
import express from 'express'


const StartServer = async()=>{
    const app = express()
    await DB();
    await App(app);
    app.listen(8080,()=>{
        console.log("Server Started At Port 8080")
    })   
}

StartServer()