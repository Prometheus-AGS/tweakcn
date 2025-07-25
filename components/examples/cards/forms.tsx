"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useId } from "react";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    description: "Perfect for individuals getting started.",
  },
  {
    id: "pro",
    name: "Pro",
    description: "For teams that need advanced features.",
  },
];

export function CardsForms() {
  const formId = useId();
  
  const getFieldId = (field: string) => `${formId}-${field}`;

  return (
    <Card className="@container mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Payment Information</CardTitle>
        <CardDescription>Complete your purchase below.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3 @3xl:flex-row">
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor={getFieldId("name")}>Name</Label>
              <Input id={getFieldId("name")} placeholder="Evil Rabbit" />
            </div>
            <div className="flex flex-1 flex-col gap-2">
              <Label htmlFor={getFieldId("email")}>Email</Label>
              <Input id={getFieldId("email")} placeholder="example@acme.com" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor={getFieldId("card-number")}>Card Number</Label>
            <div className="grid grid-cols-2 gap-3 @3xl:grid-cols-[1fr_80px_60px]">
              <Input
                id={getFieldId("card-number")}
                placeholder="1234 1234 1234 1234"
                className="col-span-2 @3xl:col-span-1"
              />
              <Input id={getFieldId("card-expiry")} placeholder="MM/YY" />
              <Input id={getFieldId("card-cvc")} placeholder="CVC" />
            </div>
          </div>
          <fieldset className="flex flex-col gap-3">
            <legend className="text-sm font-medium">Plan</legend>
            <p className="text-muted-foreground text-sm">
              Select the plan that best fits your needs.
            </p>
            <RadioGroup defaultValue="starter" className="grid gap-3 @3xl:grid-cols-2">
              {PLANS.map((plan) => (
                <Label
                  className="has-[[data-state=checked]]:border-ring has-[[data-state=checked]]:bg-input/20 flex items-start gap-3 rounded-lg border p-3"
                  key={plan.id}
                  htmlFor={getFieldId(`plan-${plan.id}`)}
                >
                  <RadioGroupItem
                    value={plan.id}
                    id={getFieldId(`plan-${plan.id}`)}
                    className="data-[state=checked]:border-primary"
                  />
                  <div className="grid gap-1 font-normal">
                    <div className="font-medium">{plan.name}</div>
                    <div className="text-muted-foreground text-xs leading-snug text-balance">
                      {plan.description}
                    </div>
                  </div>
                </Label>
              ))}
            </RadioGroup>
          </fieldset>
          <div className="flex flex-col gap-2">
            <Label htmlFor={getFieldId("notes")}>Notes</Label>
            <Textarea id={getFieldId("notes")} placeholder="Enter notes" />
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Checkbox id={getFieldId("terms")} />
              <Label htmlFor={getFieldId("terms")} className="font-normal">
                I agree to the terms and conditions
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id={getFieldId("newsletter")} defaultChecked />
              <Label htmlFor={getFieldId("newsletter")} className="font-normal">
                Allow us to send you emails
              </Label>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          Cancel
        </Button>
        <Button size="sm">Subscribe</Button>
      </CardFooter>
    </Card>
  );
}
