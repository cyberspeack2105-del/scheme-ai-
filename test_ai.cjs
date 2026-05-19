const axios = require('axios');

async function test() {
  try {
    const res = await axios.post('http://localhost:8000/api/analyze-skill-gap', {
      user_skills: ['javascript', 'react'],
      target_role: 'full stack developer'
    });
    console.log("LOCAL RESPONSE:", JSON.stringify(res.data, null, 2));
  } catch (error) {
    console.error("ERROR:", error.response ? error.response.data : error.message);
  }
}
test();
