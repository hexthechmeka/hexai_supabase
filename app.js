const express = require('express')
const app = express()

require('dotenv').config()
const usageRoutes = require('./routes/usageRoutes')
const loginRoutes = require('./routes/loginRoutes')

app.use(express.json())
app.use('/login', loginRoutes)

// Routes
app.use('/usage', usageRoutes)

module.exports = app
