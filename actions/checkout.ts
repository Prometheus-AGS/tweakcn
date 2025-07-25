"use server";

import { polar } from "@/lib/polar";
import { getCurrentUser, logError } from "@/lib/shared";
import { getOrCreateCustomer } from "./customer";

export const createCheckout = async () => {
  try {
    console.log("Starting checkout process...");
    
    const user = await getCurrentUser();
    console.log("Current user:", { id: user.id, email: user.email });
    
    const customer = await getOrCreateCustomer(user);
    console.log("Customer:", { id: customer?.id });
    
    if (!customer) {
      console.error("Failed to create or get customer");
      return { error: "Failed to create customer" };
    }

    const productId = process.env.NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID;
    const baseUrl = process.env.BASE_URL;
    
    console.log("Environment variables:", {
      productId: productId ? "Set" : "Missing",
      baseUrl: baseUrl ? "Set" : "Missing",
    });

    if (!productId) {
      console.error("Missing NEXT_PUBLIC_TWEAKCN_PRO_PRODUCT_ID");
      return { error: "Product configuration error" };
    }

    if (!baseUrl) {
      console.error("Missing BASE_URL");
      return { error: "Configuration error" };
    }

    const checkoutPayload = {
      products: [productId],
      customerId: customer.id,
      successUrl: `${baseUrl}/success?checkout_id={CHECKOUT_ID}`,
    };
    
    console.log("Creating checkout with payload:", checkoutPayload);
    
    const checkout = await polar.checkouts.create(checkoutPayload);
    console.log("Checkout created:", { id: checkout.id, url: checkout.url });

    if (!checkout.url) {
      console.error("No checkout URL returned");
      return { error: "Failed to generate checkout URL" };
    }

    return { url: checkout.url };
  } catch (error) {
    console.error("Checkout error:", error);
    logError(error as Error, { action: "createCheckout" });
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("401") || error.message.includes("unauthorized")) {
        return { error: "Authentication error with payment provider" };
      } else if (error.message.includes("404") || error.message.includes("not found")) {
        return { error: "Product not found" };
      } else if (error.message.includes("network") || error.message.includes("fetch")) {
        return { error: "Network error. Please check your connection and try again." };
      }
    }
    
    return { error: "Failed to create checkout. Please try again." };
  }
};
