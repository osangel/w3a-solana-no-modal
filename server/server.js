require('dotenv').config(); // enables loading .env vars
const jwt = require('jsonwebtoken');
const fs = require('fs');
const express = require('express');
const app = express();
const cors = require('cors');
// Allow requests from client-side
app.use(cors());
const privateKey = fs.readFileSync('privateKey.pem', 'utf8'); // 读取私钥文件
const publicKey = fs.readFileSync('publicKey.pem', 'utf8');   // 读取公钥文件
const jwk = {
    kty: "RSA",
    alg: "RS256",
    use: "sig",
    kid: "955104a37fa903ed80c57145ec9e83edb29b0c45", // 与 JWT 的 'kid' 头信息匹配
    e: "65537", // 默认指数值，RSA 中通常为 65537
    n: Buffer.from(publicKey).toString('base64') // 公钥的模数，需要正确处理
};
app.get('/.well-known/jwks.json', (req, res) => {
    res.status(200).json({ keys: [jwk] });
});
app.post('/api/token', async (req, res) => {
	try {
		var privateKey = fs.readFileSync('privateKey.pem');
		var token = jwt.sign(
			{
				sub: '9fcd68c4-af50-4dd7-adf6-abd12a13cb32',
				name: 'Yashovardhan Agrawal',
				email: 'yash@web3auth.io',
				aud: 'urn:api-web3auth-io', // -> to be used in Custom Authentication as JWT Field
				iss: 'https://web3auth.io', // -> to be used in Custom Authentication as JWT Field
				iat: Math.floor(Date.now() / 1000),
				exp: Math.floor(Date.now() / 1000) + 60 * 60,
			},
			privateKey,
			{ algorithm: 'RS256', keyid: '955104a37fa903ed80c57145ec9e83edb29b0c45' },
		);
		res.status(200).json({ token });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
});

const listener = app.listen(process.env.PORT || 8080, () =>
	console.log('Listening on port ' + listener.address().port),
);
