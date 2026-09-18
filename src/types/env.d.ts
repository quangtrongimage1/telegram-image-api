declare namespace NodeJS {
   interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      BOT_TOKEN: string;
      CHAT_ID: string;
      X_API_KEY: string;
   }
}
