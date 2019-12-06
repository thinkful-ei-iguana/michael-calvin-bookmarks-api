const express = require('express');
const bookmarks = require('../dataStore');
const { isWebUri } = require('valid-url');
const uuid = require('uuid/v4');
const logger = require('../logger');

const bookmarksRouter = express.Router();
const bodyParser = express.json();

bookmarksRouter
  .route('/')
  .get((req,res) => {
    res
      .json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { name, url, rating, description = ''} = req.body;
    console.log(req.body);

    if(!name){
      logger.error('Name is required.');
      return res
        .status(400)
        .send('Required fields: Name, Rating (between 0 and 5), and valid URL');
    }
    if(!isWebUri(url)){
      logger.error('Valid URL is required.');
      return res
        .status(400)
        .send('Required fields: Name, Rating (between 0 and 5), and valid URL');
    }
    if(!Number.isInteger(rating) || rating < 0 || rating > 5){
      logger.error('Rating is out of range between 0 and 5.')
      return res
        .status(400)
        .send('Required fields: Name, Rating (between 0 and 5), and valid URL')
    }

    const id = uuid();
    
    const bookmark = {
      id,
      name,
      url,
      rating,
      description
    };

    bookmarks.push(bookmark);
    logger.info(`Card with id ${id} created`);

    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);
  });
  
bookmarksRouter
  .route('/:id')
  .get((req, res) => {
    const { id } = req.params;
    console.log(id);
    const bookmark = bookmarks.find(b => b.id == id);
    if(!bookmark){
      logger.error(`Card with id ${id} not found`);
      return res
        .status(404)
        .send('Card Not Found');
    }
    res.json(bookmark);
  })
  .delete((req, res) => {
    const { id } = req.params;

    const index = bookmarks.findIndex(b => b.id == id);
    if (index === -1){
      logger.error(`Bookmark with id ${id} does not exist.`);
      return res
        .status(404)
        .send('Not found');
    }

    bookmarks.splice(index, 1);

    logger.info(`Bookmark with id ${id} deleted.`);

    res
      .status(204)
      .end();
  });

module.exports = bookmarksRouter;
