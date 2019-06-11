require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const winston = require('winston');
const { NODE_ENV } = require('./config');

const app = express();

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({
      filename: 'info.log'
    })
  ]
});

if (NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }))
}

const morganSetting = 
  NODE_ENV === "production"
  ? "tiny"
  : "dev"

app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(express.json());

const validateBearerToken = (req,res,next) => {
  const apiToken = process.env.API_TOKEN;
  const authToken = req.get('Authorization');

  if (!authToken || authToken.split(" ")[1] !== apiToken) {
    logger.error(`Unauthorized request to path: ${req.path}`);
    return res.status(401).json({
      error: 'Unauthorized request'
    })
  }
  next();
}

app.use(validateBearerToken);

// arrays for storing cards & lists
const cards = [
  {
    id: 1,
    title: 'Card 1 Title',
    content: 'lorem ipsum dolor content ispum blah blah'
  }
];

const lists = [
  {
    id: 1,
    header: 'List 1 Header',
    cardIds: [1]
  }
];

app.get('/', (req, res) => {
  res.send("Hello World!");
});

const errorHandler = (error,req,res,next) => {
  let response;
  if (NODE_ENV === "production") {
    response = { error : { message: "server error" } }
  }else{
    console.error(error);
    response = { message: error.message, error }
  }
  res.status(500).json(response);
}

app.use(errorHandler);

module.exports = app;