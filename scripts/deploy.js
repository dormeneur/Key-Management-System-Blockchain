const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("Deploying KeyLifecycleManager...");

    const Factory = await hre.ethers.getContractFactory("KeyLifecycleManager");
    const contract = await Factory.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log(`✅ KeyLifecycleManager deployed to: ${address}`);

    // Write address to frontend constants so the React app can pick it up
    const outDir = path.join(__dirname, "..", "frontend", "src", "constants");
    if (!fs.existsSync(outDir)) {
        fs.mkdirSync(outDir, { recursive: true });
    }
    fs.writeFileSync(
        path.join(outDir, "contractAddress.json"),
        JSON.stringify({ address }, null, 2)
    );
    console.log(`📄 Contract address written to frontend/src/constants/contractAddress.json`);

    // Copy ABI to frontend
    const artifact = await hre.artifacts.readArtifact("KeyLifecycleManager");
    fs.writeFileSync(
        path.join(outDir, "abi.json"),
        JSON.stringify(artifact.abi, null, 2)
    );
    console.log(`📄 ABI written to frontend/src/constants/abi.json`);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
