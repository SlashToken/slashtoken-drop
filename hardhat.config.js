require("@nomicfoundation/hardhat-toolbox");
require("@nomiclabs/hardhat-web3");

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    compilers: [
        {
          version: "0.8.19",
          settings: {
            optimizer: {
              enabled: true,
              runs: 9999999
            }
          }
        },
        {
          version: "0.8.22",
          settings: {
            optimizer: {
              enabled: true,
              runs: 9999999
            }
          }
        },
        {
          version: "0.8.23",
          settings: {
            optimizer: {
              enabled: true,
              runs: 9999999
            }
          }
        },
        {
          version: "0.8.24",
          settings: {
            optimizer: {
              enabled: true,
              runs: 9999999
            },
            evmVersion: 'cancun'
          }
        }
    ]
  },
  gasReporter: {
    enabled: true
  },
  sourcify: {
    enabled: true
  },
  networks: {
    hardhat: {
      gasPrice: 40000000000
    },
    polygon: {
      url: "https://polygon-rpc.com/"
    },
    binance: {
      url: "https://bsc-dataseed.binance.org/"
    },
    ethereum: {
      url: 'https://ethereum.publicnode.com/'
    },
    fantom: {
      url: 'https://rpc.ftm.tools/'
    },
    base: {
      url: 'https://mainnet.base.org/'
    },
    blast: {
      url: 'https://rpc.blast.io'
    },
    avax: {
      url: 'https://api.avax.network/ext/bc/C/rpc'
    },
    arb: {
      url: 'https://arbitrum-one.publicnode.com',
      accounts: ['']
    },
    chiliz: {
      url: 'https://rpc.ankr.com/chiliz',
      accounts: ['']
    },
    polygon_mumbai: {
      url: "https://polygon-testnet.public.blastapi.io",
      accounts: ['']
    },
    binance_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
      accounts: ['']
    },
    op_testnet: {
      url: "https://sepolia.optimism.io",
      accounts: ['']
    },
    op: {
      url: "https://mainnet.optimism.io",
      accounts: ['']
    },
    op_sepolia_testnet: {
      url: "https://sepolia.optimism.io",
      accounts: ['']
    },
    sepolia: {
      url: 'https://eth-sepolia-public.unifra.io',
      accounts: ['']
    },
    fantom_testnet: {
      url: 'https://rpc.testnet.fantom.network/'
    },
    avax_testnet: {
      url: 'https://api.avax-test.network/ext/bc/C/rpc'
    },
    base_testnet: {
      url: 'https://sepolia.base.org/',
      accounts: ['']
    },
    spicy_testnet: {
      url: 'https://spicy-rpc.chiliz.com/',
      accounts: ['']
    },
    arb_goerli: {
      url: 'https://rpc.goerli.arbitrum.gateway.fm',
      accounts: ['']
    },
    arb_sepolia: {
      url: 'https://arbitrum-sepolia.blockpi.network/v1/rpc/public',
      accounts: ['']
    },
    blast_testnet: {
      url: 'https://blast-sepolia.blockpi.network/v1/rpc/public',
      accounts: ['']
    },
    ape_testnet: {
      url: 'https://curtis.rpc.caldera.xyz/http',
      accounts: ['']
    },
    sonic_testnet: {
      url: 'https://rpc.blaze.soniclabs.com',
      accounts: ['']
    },
    abstract_testnet: {
      url: 'https://api.testnet.abs.xyz',
      accounts: ['']
    },
    apechain: {
      url: 'https://rpc.apechain.com',
    },
    bera_testnet: {
      url: 'https://bepolia.rpc.berachain.com',
      accounts: ['']
    },
    soneium_testnet: {
      url: 'https://rpc.minato.soneium.org',
      accounts: ['']
    },
    unichain_testnet: {
      url: 'https://unichain-sepolia.drpc.org',
      accounts: ['']
    },
    cronos_testnet: {
      url: 'https://cronos-testnet.drpc.org',
      accounts: ['']
    },
    zora_testnet: {
      url: 'https://sepolia.rpc.zora.energy',
      accounts: ['']
    }
  },

  etherscan: {
    apiKey: {

    },
    customChains: [
       {
        network: "apechain",
        chainId: 33139,
        urls: {
          apiURL: "https://apechain.calderaexplorer.xyz/api",
          browserURL: "https://apechain.calderaexplorer.xyz/"
        }
      },
      {
        network: "curtis",
        chainId: 33111,
        urls: {
          apiURL: "https://curtis.explorer.caldera.xyz/api",
          browserURL: "https://curtis.explorer.caldera.xyz/"
        }
      },
      {
        network: "base",
        chainId: 8453,
        urls: {
          apiURL: "https://api.basescan.org/api",
          browserURL: "https://basescan.org"
        }
      },
      {
        network: "spicy_testnet",
        chainId: 88882,
        urls: {
          apiURL: "https://spicy-explorer.chiliz.com/api",
          browserURL: "https://spicy-explorer.chiliz.com/"
        }
      },
      {
        network: "chiliz",
        chainId: 88888,
        urls: {
          apiURL: "https://api.routescan.io/v2/network/mainnet/evm/88888/etherscan",
          browserURL: "https://chiliscan.com"
        }
      },
      {
        network: "op_sepolia_testnet",
        chainId: 11155420,
        urls: {
          apiURL: "https://api-sepolia-optimistic.etherscan.io/api",
          browserURL: "https://sepolia-optimism.etherscan.io/"
        }
      },
      {
        network: "arb_sepolia_testnet",
        chainId: 421614,
        urls: {
          apiURL: "https://api-sepolia.arbiscan.io/api",
          browserURL: "https://sepolia.arbiscan.io"
        }
      },
      {
        network: "base_testnet",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org"
        }
      },
      {
        network: "blast",
        chainId: 81457,
        urls: {
          apiURL: "https://api.blastscan.io/api",
          browserURL: "https://blastscan.io"
        }
      },
      {
        network: "blast_testnet",
        chainId: 168587773,
        urls: {
          apiURL: "https://api-sepolia.blastscan.io/api",
          browserURL: "https://sepolia.blastscan.io"
        }
      }
    ]
  }
};
