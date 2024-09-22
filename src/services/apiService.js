const axios = require('axios');

function generateToken() {
    let data = JSON.stringify({
        "tenant_id": "ant_engage",
        "tenant_secret": "0a49baf3abaf1c7681b4e3b39b21c95cad4c5d3049a4a1b21bf211f9e2f37dc3"
    });

    let config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `http://103.252.242.88:2024/api/generate-token`,
        headers: {
            'Content-Type': 'application/json'
        },
        data: data
    };

    return axios.request(config)
        .then((response) => {
            console.log("Token data:", JSON.stringify(response.data));
            return response.data;
        })
        .catch((error) => {
            console.error("Error generating token:", error);
        });
}

module.exports = { generateToken };
