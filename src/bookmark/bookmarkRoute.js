

app.get('/bookmarks', (req, res) => {
    res.json(bookmarks);
  });
  
  app.get('/bookmarks/:id', (req, res) => {
    const { id } = req.params;
    const bookmark = bookmarks.find(bookmark => bookmark.id == id);
  
    if(!bookmark){
      logger.error(`Bookmark with id ${id} not found.`);
      return res
        .status(404)
        .send('Bookmark Not Found');
    }
    res.json(bookmark);
  });
  
  app.post('/bookmarks', (req, res) => {
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