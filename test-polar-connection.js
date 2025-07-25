// Test script to verify Polar API connection
const { Polar } = require("@polar-sh/sdk");

const polar = new Polar({
  accessToken: process.env.POLAR_ACCESS_TOKEN,
  server: process.env.NODE_ENV === "production" ? "production" : "sandbox",
});

async function testPolarConnection() {
  console.log("Testing Polar API connection...");
  console.log("Environment:", process.env.NODE_ENV);
  console.log("Server:", process.env.NODE_ENV === "production" ? "production" : "sandbox");
  console.log("Access Token:", process.env.POLAR_ACCESS_TOKEN ? "Set (length: " + process.env.POLAR_ACCESS_TOKEN.length + ")" : "Missing");
  
  try {
    // Try to list products to test API connection
    console.log("Attempting to list products...");
    const products = await polar.products.list({ limit: 1 });
    console.log("✅ API connection successful");
    console.log("Products found:", products.result?.length || 0);
    
    if (products.result && products.result.length > 0) {
      console.log("First product:", {
        id: products.result[0].id,
        name: products.result[0].name,
      });
    }
  } catch (error) {
    console.error("❌ API connection failed:");
    console.error("Error:", error.message);
    console.error("Status:", error.status);
    console.error("Response:", error.response?.data);
  }
}

testPolarConnection().catch(console.error);
