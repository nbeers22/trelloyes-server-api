const express = require('express');
const listRouter = express.Router();
const bodyParser = express.json();

const uuid = require('uuid/v4');
const logger = require('../logger.js');
const { cards, lists } = require('../store.js');

listRouter
  .route('/lists')
  .get( (req,res) => {
    res.json(lists);
  })
  .post( bodyParser, (req,res) => {
    const { header, cardIds = [] } = req.body;

    if(!header){
      logger.error(`Failed POST request to ${req.path}: Missing header.`);
      return res
        .status(400)
        .json({ error: "POST request failed" });
    }
    // Check if card IDs actually exist
    if(cardIds.length > 0){
      let valid = true;
      cardIds.forEach( cardId => {
        const card = cards.find( cd => cd.id === cardId);
        if(!card){
          logger.error(`Card with id ${cardId} not found.`);
          valid = false;
        }
      });

      if(!valid){
        return res
          .status(400)
          .send('Invalid Data');
      }
    }

    const id = uuid();
    const list = {
      id,
      header,
      cardIds
    }
    lists.push(list);
    logger.info(`List with id ${id} created`);
    res
      .status(201)
      .location(`http://localhost:4000/lists/${id}`)
      .json(list);
  });

listRouter
  .route('/lists/:id')
  .get( (req,res) => {
    const { id } = req.params;
    const list = lists.find(list => list.id == id);
  
    // make sure we found a list
    if (!list) {
      logger.error(`List with id: ${id} not found.`);
      return res
        .status(404)
        .send('List Not Found');
    }
  
    res.json(list);
  })
  .delete( (req,res) => {
    const { id } = req.params;
    const listIndex = lists.findIndex( list => list.id === id );
  
    if (listIndex === -1) {
      logger.error(`List with id: ${id} not found`);
      return res
        .status(404)
        .send('Not Found')
    }
  
    lists.splice(listIndex,1);
    logger.info(`List with id: ${id} was deleted`);
    res.status(204).end();
  });

module.exports = listRouter;