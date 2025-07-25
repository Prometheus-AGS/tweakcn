import "server-only";

import { polar } from "@/lib/polar";
import { logError } from "@/lib/shared";
import { Customer } from "@polar-sh/sdk/models/components/customer.js";
import { User } from "better-auth";

export const getOrCreateCustomer = async (user: User) => {
  let customer: Customer | null = null;

  console.log("Starting getOrCreateCustomer for user:", { 
    id: user.id, 
    email: user.email, 
    name: user.name 
  });

  // Try to get existing customer
  try {
    console.log("Attempting to get existing customer with externalId:", user.id);
    customer = await polar.customers.getExternal({ externalId: user.id });
    console.log("Found existing customer:", { id: customer?.id });
  } catch (error) {
    console.log("No existing customer found, will create new one. Error:", error);
    customer = null;
  }

  if (customer) {
    console.log("Returning existing customer:", { id: customer.id });
    return customer;
  }

  // Create new customer
  try {
    console.log("Creating new customer with data:", {
      email: user.email,
      externalId: user.id,
      name: user.name,
    });

    const newCustomer = await polar.customers.create({
      email: user.email,
      externalId: user.id,
      name: user.name,
    });

    console.log("Successfully created new customer:", { 
      id: newCustomer?.id,
      email: newCustomer?.email 
    });

    return newCustomer;
  } catch (err) {
    console.error("Failed to create customer. Detailed error:", err);
    console.error("Error message:", (err as Error).message);
    console.error("Error stack:", (err as Error).stack);
    
    // Check if it's a specific API error
    if (err && typeof err === 'object' && 'response' in err) {
      console.error("API Response Error:", JSON.stringify(err, null, 2));
    }

    logError(err as Error, { action: "createCustomer", user });
  }

  console.log("Returning null - customer creation failed");
  return null;
};
