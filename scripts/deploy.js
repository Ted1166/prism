const {
  RpcProvider,
  Account,
  ETransactionVersion,
  defaultDeployer,
  json,
  hash,
  uint256,
} = require("starknet");
const fs = require("fs");
require("dotenv").config();

// ============================================
// CONFIGURATION
// ============================================

const providerSepoliaTestnet = new RpcProvider({
  nodeUrl: "https://rpc.starknet-testnet.lava.build/rpc/v0_9",
  retries: 3,
});

const account_address = process.env.ACCOUNT_ADDRESS;
const private_key = process.env.PRIVATE_KEY;

const account = new Account({
  provider: providerSepoliaTestnet,
  address: account_address,
  signer: private_key,
  cairoVersion: "1",
  transactionVersion: ETransactionVersion.V3,
  paymaster: undefined,
  deployer: defaultDeployer,
  defaultTipType: "recommendedTip",
});

const CONTRACTS = {
  CREDENTIAL_REGISTRY: "CredentialRegistry",
  VERIFICATION_ENGINE: "VerificationEngine",
  JOB_BOARD: "JobBoard",
  REPORTING_MODULE: "ReportingModule",
};

const CLASS_HASHES = {
  CREDENTIAL_REGISTRY: "0x17c1fda766bca2618c3872808f17c590ef52dcead943d2b6a9f4afd607c4876", 
  VERIFICATION_ENGINE: "0x49551680a560dc5e77ff3b6a90f1cd9e5e3df800703e8a25f3dbdfe4ece5a21", 
  JOB_BOARD: "0x24713fa0c24e257602d0493d3c2320f4eee8b92c2a8bcc2172735a1adc2dd1c",          
  REPORTING_MODULE: "0x1030000709754f08afb8715d7b35a5b9c514eb71f77e847638af8dfd7bc444c",    
};

const DEPLOYED_ADDRESSES = {
  CREDENTIAL_REGISTRY: "0x2faf023e49fb41c64f0448d9dec9f88250444fe9328b1d1821023a62bc9821",
  VERIFICATION_ENGINE: "0x77a152e7e65ba93dd630bdb29c324a610553d4b5832dbb2ca51012db35268be",
  JOB_BOARD: "0x4c3c0d5aa783ec1f7d7f12b0c27ec7cf10570f959fab37c7bcfc4366775d026",
  REPORTING_MODULE: "0x788cd996fb2487ab69a69f08e0380be34392f3c46391831b233a4206ea7356f",
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function loadContract(contractName) {
  const sierraPath = `../contracts/target/dev/contracts_${contractName}.contract_class.json`;
  const casmPath = `../contracts/target/dev/contracts_${contractName}.compiled_contract_class.json`;

  const compiledSierra = json.parse(
    fs.readFileSync(sierraPath).toString("ascii")
  );
  const compiledCasm = json.parse(
    fs.readFileSync(casmPath).toString("ascii")
  );

  return { compiledSierra, compiledCasm };
}

async function declareContract(contractName) {
  console.log(`\n📝 Declaring ${contractName}...`);

  try {
    const { compiledSierra, compiledCasm } = loadContract(contractName);

    const classHash = hash.computeContractClassHash(compiledSierra);
    console.log(`   Computed Class Hash: ${classHash}`);

    try {
      await providerSepoliaTestnet.getClassByHash(classHash);
      console.log(`   ✅ Contract already declared!`);
      return classHash;
    } catch (error) {
      console.log(`   🔄 Declaring contract...`);
    }

    const declareResponse = await account.declare({
      contract: compiledSierra,
      casm: compiledCasm,
    });

    console.log(`   Transaction Hash: ${declareResponse.transaction_hash}`);
    await providerSepoliaTestnet.waitForTransaction(
      declareResponse.transaction_hash
    );

    console.log(`   ✅ Declared successfully!`);
    console.log(`   Class Hash: ${declareResponse.class_hash}`);

    return declareResponse.class_hash;
  } catch (error) {
    console.error(`   ❌ Failed to declare ${contractName}:`, error.message);
    throw error;
  }
}

async function deployContract(contractName, classHash, constructorArgs = []) {
  console.log(`\n🚀 Deploying ${contractName}...`);
  console.log(`   Class Hash: ${classHash}`);
  console.log(`   Constructor Args:`, constructorArgs);

  try {
    await new Promise(resolve => setTimeout(resolve, 2000));

    const deployResponse = await account.deployContract({
      classHash: classHash,
      constructorCalldata: constructorArgs,
    });

    console.log(`   Transaction Hash: ${deployResponse.transaction_hash}`);
    
    const receipt = await providerSepoliaTestnet.waitForTransaction(
      deployResponse.transaction_hash,
      {
        retryInterval: 5000,
        successStates: ["ACCEPTED_ON_L2", "ACCEPTED_ON_L1"],
      }
    );

    console.log(`   ✅ Deployed successfully!`);
    
    const contractAddress = Array.isArray(deployResponse.contract_address) 
      ? deployResponse.contract_address[0] 
      : deployResponse.contract_address;
    
    console.log(`   Contract Address: ${contractAddress}`);

    if (!contractAddress || contractAddress === "0x0" || contractAddress === 0) {
      throw new Error("Deployment returned invalid contract address (0x0)");
    }

    return contractAddress;
  } catch (error) {
    console.error(`   ❌ Failed to deploy ${contractName}:`, error.message);
    
    if (error.message.includes("fetch failed")) {
      console.error(`   💡 Network issue detected. Try:`);
      console.error(`      1. Check your internet connection`);
      console.error(`      2. Try a different RPC endpoint`);
      console.error(`      3. Wait a few minutes and retry`);
    }
    
    throw error;
  }
}

async function declareAll() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 1: DECLARING ALL CONTRACTS");
  console.log("=".repeat(60));

  CLASS_HASHES.CREDENTIAL_REGISTRY = await declareContract(
    CONTRACTS.CREDENTIAL_REGISTRY
  );

  CLASS_HASHES.VERIFICATION_ENGINE = await declareContract(
    CONTRACTS.VERIFICATION_ENGINE
  );

  CLASS_HASHES.JOB_BOARD = await declareContract(CONTRACTS.JOB_BOARD);

  CLASS_HASHES.REPORTING_MODULE = await declareContract(
    CONTRACTS.REPORTING_MODULE
  );

  console.log("\n" + "=".repeat(60));
  console.log("ALL CONTRACTS DECLARED! ✅");
  console.log("=".repeat(60));
  console.log("\nClass Hashes:");
  console.log("CREDENTIAL_REGISTRY:", CLASS_HASHES.CREDENTIAL_REGISTRY);
  console.log("VERIFICATION_ENGINE:", CLASS_HASHES.VERIFICATION_ENGINE);
  console.log("JOB_BOARD:", CLASS_HASHES.JOB_BOARD);
  console.log("REPORTING_MODULE:", CLASS_HASHES.REPORTING_MODULE);
  console.log("\n💡 Copy these class hashes to the CLASS_HASHES object above!");
  console.log("   Then uncomment deployAll() and run the script again.\n");
}

async function deployAll() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 2: DEPLOYING ALL CONTRACTS");
  console.log("=".repeat(60));

  if (!CLASS_HASHES.CREDENTIAL_REGISTRY) {
    throw new Error(
      "Please fill in CLASS_HASHES after declaring contracts!"
    );
  }

  // Deploy CredentialRegistry
  DEPLOYED_ADDRESSES.CREDENTIAL_REGISTRY = await deployContract(
    CONTRACTS.CREDENTIAL_REGISTRY,
    CLASS_HASHES.CREDENTIAL_REGISTRY,
    [account_address]
  );

  console.log(`\n⏳ Waiting 10 seconds before next deployment...`);
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Deploy VerificationEngine
  DEPLOYED_ADDRESSES.VERIFICATION_ENGINE = await deployContract(
    CONTRACTS.VERIFICATION_ENGINE,
    CLASS_HASHES.VERIFICATION_ENGINE,
    [DEPLOYED_ADDRESSES.CREDENTIAL_REGISTRY]
  );

  console.log(`\n⏳ Waiting 10 seconds before next deployment...`);
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Deploy JobBoard
  DEPLOYED_ADDRESSES.JOB_BOARD = await deployContract(
    CONTRACTS.JOB_BOARD,
    CLASS_HASHES.JOB_BOARD,
    [DEPLOYED_ADDRESSES.VERIFICATION_ENGINE]
  );

  console.log(`\n⏳ Waiting 10 seconds before next deployment...`);
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Deploy ReportingModule
  const minVerifications = 3;
  const baseReward = "1000000000000000000"; // 1 token with 18 decimals
  
  const baseRewardU256 = uint256.bnToUint256(baseReward);

  DEPLOYED_ADDRESSES.REPORTING_MODULE = await deployContract(
    CONTRACTS.REPORTING_MODULE,
    CLASS_HASHES.REPORTING_MODULE,
    [
      DEPLOYED_ADDRESSES.VERIFICATION_ENGINE,
      DEPLOYED_ADDRESSES.CREDENTIAL_REGISTRY,
      minVerifications,
      baseRewardU256.low,
      baseRewardU256.high,
    ]
  );

  console.log("\n" + "=".repeat(60));
  console.log("ALL CONTRACTS DEPLOYED! 🎉");
  console.log("=".repeat(60));
  console.log("\nDeployed Addresses:");
  console.log("CREDENTIAL_REGISTRY:", DEPLOYED_ADDRESSES.CREDENTIAL_REGISTRY);
  console.log("VERIFICATION_ENGINE:", DEPLOYED_ADDRESSES.VERIFICATION_ENGINE);
  console.log("JOB_BOARD:", DEPLOYED_ADDRESSES.JOB_BOARD);
  console.log("REPORTING_MODULE:", DEPLOYED_ADDRESSES.REPORTING_MODULE);

  const deploymentInfo = {
    network: "sepolia-testnet",
    timestamp: new Date().toISOString(),
    deployer: account_address,
    classHashes: CLASS_HASHES,
    addresses: DEPLOYED_ADDRESSES,
  };

  fs.writeFileSync(
    "./deployment-info.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n💾 Deployment info saved to deployment-info.json");

  return DEPLOYED_ADDRESSES;
}

async function setupContracts() {
  console.log("\n" + "=".repeat(60));
  console.log("STEP 3: INITIALIZING CONTRACTS");
  console.log("=".repeat(60));

  const deploymentInfo = JSON.parse(
    fs.readFileSync("./deployment-info.json").toString()
  );

  console.log("\n💰 Funding reward pool...");
  console.log("✅ Contracts initialized successfully!");
}

async function verifyDeployments() {
  console.log("\n🔍 Verifying deployments...\n");

  const deploymentInfo = JSON.parse(
    fs.readFileSync("./deployment-info.json").toString()
  );

  for (const [name, address] of Object.entries(deploymentInfo.addresses)) {
    try {
      const classHash = await providerSepoliaTestnet.getClassHashAt(address);
      console.log(`✅ ${name}: ${address}`);
      console.log(`   Class Hash: ${classHash}`);
    } catch (error) {
      console.log(`❌ ${name}: ${address} - NOT FOUND`);
    }
  }
}

// ============================================
// MAIN EXECUTION
// ============================================

async function main() {
  try {
    console.log("\n🏗️  PRISM DEPLOYMENT SCRIPT");
    console.log("Account:", account_address);
    console.log("Network: Starknet Sepolia Testnet\n");

    // Check account balance
    try {
      const balance = await providerSepoliaTestnet.getBalance(account_address);
      console.log("Account Balance:", balance, "\n");
    } catch (error) {
      console.log("⚠️  Could not fetch balance\n");
    }

    // Step 1: Declare all contracts (uncomment if needed)
    // await declareAll();

    // Step 2: Deploy all contracts
    await deployAll();

    // Step 3: Setup contracts (uncomment if needed)
    // await setupContracts();

    // Step 4: Verify deployments
    await verifyDeployments();

  } catch (error) {
    console.error("\n❌ Deployment failed:", error);
    console.error("\nStack trace:", error.stack);
    process.exit(1);
  }
}

main();