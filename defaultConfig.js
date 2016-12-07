module.exports = {
  database: process.env.MONGODB_URI,
  port: process.env.PORT || 3000,
  adminPassword: process.env.ADMIN_PASSWORD
};
