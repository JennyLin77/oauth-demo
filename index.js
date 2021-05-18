const { clientID, clientSecret } = require('./config');

const Koa = require('koa');
const serve = require('koa-static');
const route = require('koa-route');
const path = require('path');
const axios = require('axios');

const app = new Koa();

const pageResource = serve(path.join(__dirname + '/public'));

const oauth = async ctx => {
    const authorizationCode = ctx.request.query.code;
    console.log(`authorization code: ${authorizationCode}`);

    const tokenRes = await axios({
        method: 'post',
        url: 'https://github.com/login/oauth/access_token?' +
            `client_id=${clientID}&` +
            `client_secret=${clientSecret}&` +
            `code=${authorizationCode}`,
        headers: {
            accept: 'application/json',
        },
    });

    const accessToken = tokenRes.data.access_token;
    console.log(`access token: ${accessToken}`);

    const userInfoRes = await axios({
        method: 'get',
        url: 'https://api.github.com/user',
        headers: {
            accept: 'application/json',
            Authorization: `token ${accessToken}`,
        },
    });
    console.log(`userInfo: ${userInfoRes.data}`);

    const userName = userInfoRes.data.login;
    ctx.response.redirect(`/welcome.html?name=${userName}`);
};

app.use(pageResource);
app.use(route.get('/oauth/redirect', oauth));

app.listen(8080);

