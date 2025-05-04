const serverlessExpress = require('@vendia/serverless-express');
const { app, initializeApp } = require('./index');

let serverlessExpressInstance;

async function getServerlessExpressInstance() {
  if (!serverlessExpressInstance) {
    await initializeApp();
    serverlessExpressInstance = serverlessExpress({ app });
  }
  return serverlessExpressInstance;
}

exports.handler = async (event, context) => {
  const instance = await getServerlessExpressInstance();
  return instance(event, context);
}; 