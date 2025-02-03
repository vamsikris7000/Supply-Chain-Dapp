const path = require("path");

module.exports = {
  compilers: {
    solc: {
      settings: {
        optimizer: {
          enabled: true,
          runs: 200  
        }
      }
    }
  },
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545, // Ganache GUI port
      network_id: "*",
      gas: 12000000,  // Increase Gas Limit to 12M
      gasPrice: 20000000000 // 20 Gwei
    },
  },
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
};
