require('dotenv').config();

module.exports = {
  apps: [
    {
      name: 'webui',

      script: 'build/index.js',

      cwd: '/root/workspace/bluewayate2020chat/webui',

      instances: 1,

      exec_mode: 'fork',

      env: {
        NODE_ENV: 'production',
        PORT: 3030,
      },
    },
  ],
};