const express = require('express');
const { v4: uuid } = require('uuid');
const logger = require('../logger');
const bookmarks = require('../bookmarkStore');
const { router } = require('../app');
const BookmarksService = require('./bookmarks-service');

const bookmarkRouter = express.Router();
const bodyParser = express.json();

const serializeBookmark = bookmark => ({
  id: bookmark.id,
  title: bookmark.title,
  url: bookmark.url,
  description: bookmark.description,
  rating: Number(bookmark.rating),
})

bookmarkRouter
  .route('/bookmarks')
  .get((req, res, next) => {
    const knexInstance = req.app.get('db');
    BookmarksService.getAllBookmarks(knexInstance)
      .then(bookmarks => {
        res.json(bookmarks.map(serializeBookmark))
      })
      .catch(next)
  })
  .post(bodyParser, (req, res) => {
      const { title, content } = req.body;
  
      if (!title) {
          logger.error(`Title is required`);
          return res
              .status(400)
              .send('Invalid data');
      }
  
      if (!content) {
          logger.error(`Content is required`);
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
  .route('/bookmarks/:bookmark_id')
  .get((req, res, next) => {
    const { bookmark_id } = req.params
    BookmarksService.getById(req.app.get('db'), bookmark_id)
      .then(bookmark => {
        if (!bookmark) {
          logger.error(`Bookmark with id ${bookmark_id} not found.`)
          return res.status(404).json({
            error: { message: `Bookmark doesn't exist` }
          })
        }
        res.json(serializeBookmark(bookmark))
      })
      .catch(next)
  })
  .delete((req, res) => {
    const { id } = req.params;

    const bookmarkIndex = bookmarks.findIndex(b => b.id == id);

    if (bookmarkIndex === -1) {
        logger.error(`Bookmark with id ${id} not found.`);
        return res
            .status(404)
            .send('Not Found');
    }

    bookmarks.splice(bookmarkIndex, 1);

    logger.info(`Bookmark with id ${id} deleted`);

    res
        .status(204)
        .end();
})

module.exports = bookmarkRouter;