module.exports = {
    apps: [
      {
        name: "backend",
        script: "node_modules/nodemon/bin/nodemon.js", // 👈 run nodemon directly
        args: "server.js",  // replace with your backend entry file
        cwd: "./backend",
        watch: true
      },
      {
        name: "frontend",
        script: "node_modules/react-scripts/bin/react-scripts.js",
        args: "start",
        cwd: "./frontend",
        env: {
          BROWSER: "none" // 👈 prevents React from trying to auto-open Chrome
        }
      }
    ]
  };
  