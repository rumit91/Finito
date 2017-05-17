# Finito
Need to feel like you've accomplished something? View all of your completed Wunderlist tasks with Finito!

## Implementation
- [Express](https://github.com/expressjs/express) - framework for simple server routing.
- [Pug](https://github.com/pugjs/pug) - simple template engine for displaying the HTML on the client.

## Config
In order to run this node module you'll need to create a Grant configuration file, `config.json`, with your own parameters:
```
{
  "server": {
    "protocol": "http",
    "host": "localhost:3000",
    "state": "true"
  },
  "wunderlist": {
    "authorize_url": "https://www.wunderlist.com/oauth/authorize",
    "access_url": "https://www.wunderlist.com/oauth/access_token",
    "oauth": 2,
    "key": "[wunderlist_client_id]",
    "secret": "[wunderlist_client_id]",
    "callback": "/wunderlistCallback"
  }
}
```
More info about Grant config files [here](https://github.com/simov/grant#configuration) and a helpful [Grant guide here](https://scotch.io/tutorials/implement-oauth-into-your-express-koa-or-hapi-applications-using-grant).

## Deployment Notes
### Changing the Port Setting
When deploying to Azure the port that Express is litening to need to be set to `process.env.port` for things to work properly.
```
app.listen(process.env.port || 3000, function () {
    console.log('Server is running...');
});
```
