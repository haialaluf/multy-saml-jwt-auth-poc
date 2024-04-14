import { EXPRESS_PORT } from "./constants";
const config = {
  saml: {
    cert: "./src/config/saml.pem",
    entryPoint: 'https://accounts.google.com/o/saml2/idp?idpid=APP_ID',
    issuer: 'https://accounts.google.com/o/saml2?idpid=APP_ID',
    callbackUrl: 'https://YORE_SERVER_URL/login/callback',
    options: {
      faliureFlash: true,
      failureRedirect: "/login",
    },
  },
  server: {
    port: EXPRESS_PORT,
  }
};

export default config;
