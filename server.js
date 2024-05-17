const express = require('express');
const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const port = 3000;

app.use(express.static('public'));

async function fetchAllVideos(nextCursor = '') {
  const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/video`;

  const auth = {
    username: CLOUDINARY_API_KEY,
    password: CLOUDINARY_API_SECRET,
  };


  const params = nextCursor ? { next_cursor: nextCursor } : {};

  try {
    const response = await axios.get(url, { auth, params });
    return response.data;
  } catch (error) {
    throw new Error(error.message);
  }
}

app.get('/videos', async (req, res) => {
  try {
    let allVideos = [];
    let nextCursor = '';

    do {
      const data = await fetchAllVideos(nextCursor);
      allVideos = [...allVideos, ...data.resources];
      nextCursor = data.next_cursor;
    } while (nextCursor);

    res.json(allVideos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
