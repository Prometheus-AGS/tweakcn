"use client";

import { createCheckout } from "@/actions/checkout";
import { Button } from "@/components/ui/button";
import { usePostLoginAction } from "@/hooks/use-post-login-action";
import { SUBSCRIPTION_STATUS_QUERY_KEY, useSubscription } from "@/hooks/use-subscription";
import { toast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth-store";
import { useQueryClient } from "@tanstack/react-query";
import { Gem, Loader } from "lucide-react";
import { useRouter } from "next/navigation";
import { ComponentProps, useTransition } from "react";

interface CheckoutButtonProps extends ComponentProps<typeof Button> {}

export function CheckoutButton({ disabled, className, ...props }: CheckoutButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const { data: session } = authClient.useSession();
  const { openAuthDialog } = useAuthStore();

  usePostLoginAction("CHECKOUT", () => {
    handleOpenCheckout();
  });

  const queryClient = useQueryClient();
  const { subscriptionStatus } = useSubscription();
  const isPro = subscriptionStatus?.isSubscribed ?? false;

  const handleOpenCheckout = async () => {
    console.log("Checkout button clicked");
    console.log("Session:", !!session);
    console.log("Subscription status:", subscriptionStatus);

    if (!session) {
      console.log("No session, opening auth dialog");
      openAuthDialog("signup", "CHECKOUT");
      return;
    }

    if (subscriptionStatus?.isSubscribed) {
      console.log("Already subscribed, redirecting to settings");
      router.push("/settings");
      return;
    }

    startTransition(async () => {
      try {
        console.log("Creating checkout...");
        const res = await createCheckout();
        console.log("Checkout response:", res);

        if ("error" in res || !res.url) {
          console.error("Checkout error:", res.error);
          toast({
            title: "Error",
            description: res.error || "Failed to create checkout",
            variant: "destructive",
          });
          return;
        }

        console.log("Redirecting to checkout URL:", res.url);
        queryClient.invalidateQueries({ queryKey: [SUBSCRIPTION_STATUS_QUERY_KEY] });
        
        // Use window.location instead of router.push for external URLs
        window.location.href = res.url;
      } catch (error) {
        console.error("Unexpected error in checkout:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred. Please try again.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <Button
      variant={isPro ? "ghost" : "default"}
      disabled={isPending || disabled}
      className={cn(isPro ? "border" : "", className)}
      {...props}
      onClick={handleOpenCheckout}
    >
      {isPending ? (
        <div className="flex items-center gap-2">
          <Loader className="size-4 animate-spin" />
          Redirecting to Checkout
        </div>
      ) : isPro ? (
        <span className="flex items-center gap-1.5">
          <Gem />
          {`You're Subscribed to Pro`}
        </span>
      ) : (
        "Upgrade to Pro"
      )}
    </Button>
  );
}
