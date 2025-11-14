const axios = require('axios');

const fetchExtract = async (title) => {
  try {
    const response = await axios.get(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`,
      {
        headers: {
          'User-Agent': 'SmartStudyAssistant/1.0 (https://github.com/Arpitm544; contact: arpitmaurya@example.com)',
          'Accept': 'application/json'
        },
      }
    );

    // Wikipedia returns JSON like { title, extract, description, content_urls... }
    if (response.data && response.data.extract) {
      return {
        title: response.data.title,
        extract: response.data.extract
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Error fetching Wikipedia extract:', error.message);
    return null;
  }
};

module.exports = { fetchExtract };