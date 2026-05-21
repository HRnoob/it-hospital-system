module.exports = {
  apps: [{
    name: 'it-hospital',
    script: 'npm',
    args: 'run start',
    cwd: './',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}