const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('./logger');
const bookmarks = require('./bookmarkStore');


const bookmarkRouter = express.Router();
const bodyParser = express.json();

bookmarkRouter
  .route('/')
  .get((req, res) => {
    res.json(bookmarks);
  })
  .post(bodyParser, (req, res) => {
    const { title, content } = req.body;

    if (!title) {
      logger.error('Title is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    if (!content) {
      logger.error('Content is required');
      return res
        .status(400)
        .send('Invalid data');
    }

    // get an id
    const id = uuid();

    const bookmark = {
      id,
      title,
      content
    };

    bookmarks.push(bookmark);

    logger.info(`Bookmark with id ${id} created`);
    res
      .status(201)
      .location(`http://localhost:8000/bookmarks/${id}`)
      .json(bookmark);

  });

bookmarkRouter
  .route('/:bookmark_id')
  .get((req, res) => {
    const { bookmark_id } = req.params;
    console.log(bookmark_id);
    const bookmark = bookmarks.find(bookmark => bookmark.id == bookmark_id);

    if(!bookmark){
      logger.error(`Bookmark with id ${bookmark_id} not found.`);
      return res
        .status(404)
        .send('Bookmark Not Found');
    }
    res.json(bookmark);
  })

  .delete((req, res) => {
    const { bookmark_id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(b => b.id == bookmark_id);
    console.log(bookmarkIndex);
    if (bookmarkIndex === -1) {
      logger.error(`Bookmark with id ${bookmark_id} not found.`);
      return res
        .status(404)
        .send('Not Found');
    }

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${bookmark_id} deleted`);

    res
      .status(204)
      .end();
  });

module.exports = bookmarkRouter;