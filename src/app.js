require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');

const { NODE_ENV } = require('./config');
const cardRouter = require('./card/cardRouter.js');
const listRouter = require('./list/listRouter.js');

const app = express();

const morganSetting = 
  NODE_ENV === "production"
  ? "tiny"
  : "dev"

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
app.use(morgan(morganSetting));
app.use(helmet());
app.use(cors());
app.use(cardRouter);
app.use(listRouter);

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