const express = require('express');

const cardRouter = express.Router();
const bodyParser = express.json();
const uuid = require('uuid/v4');
const logger = require('../logger.js');
const { cards, lists } = require('../store.js');

cardRouter
  .route('/cards')
  .get( (req,res) => {
    res.json(cards);
  })
  .post( bodyParser, (req,res) => {
    const { title, content } = req.body;

    if(!title || !content){
      logger.error(`Failed POST request to ${req.path}. Missing title or content`);
      return res
        .status(400)
        .json({ error: "POST request failed" });
    }
    const id = uuid();
    const card = {
      id,
      title,
      content
    }
    cards.push(card);
    logger.info(`Card with id ${id} created`);
    res
      .status(201)
      .location(`http://localhost:4000/cards/${id}`)
      .json(card);
  });

cardRouter
  .route('/cards/:id')
  .get( (req,res) => {
    const { id } = req.params;
    const card = cards.find( card => card.id === +id);

    if(!card){
      logger.error(`Card with id ${id} not found`);
      return res
        .status(404)
        .send(`Card with id ${id} not found`);
    }
    res.json(card);
  })
  .delete( (req,res) => {
    const { id } = req.params;
    const cardIndex = cards.findIndex( card => card.id === +id );
  
    if (cardIndex === -1) {
      logger.error(`Card with id: ${id} not found`);
      return res
        .status(404)
        .send('Not Found')
    }
    // remove card from cards array
    cards.splice(cardIndex,1);
  
    // remove card from all lists.cardIds
    lists.forEach( list => {
      const index = list.cardIds.findIndex( i => (
        i === +id
      ));
      if(index === -1){
        logger.error(`Can't find no card with id: ${id}`);
      }
    });
  
    list.cardIds.splice(index,1);
    logger.info(`Card with id: ${id} was deleted`);
    res.status(204).end();
  });

module.exports = cardRouter;