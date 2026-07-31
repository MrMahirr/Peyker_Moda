import { CheckCircle } from "lucide-react";
import { OrderStatus } from "./types";

interface OrderStatusStepperProps {
  currentStep: number;
  status: OrderStatus;
}

const STEPS = ["Siparis Alindi", "Hazirlaniyor", "Kargoda", "Teslim Edildi"];

export function OrderStatusStepper({
  currentStep,
  status,
}: OrderStatusStepperProps) {
  if (status === "cancelled") {
    return (
      <div className="text-rose-600 font-medium bg-rose-50 p-2 rounded">
        Siparis Iptal Edildi
      </div>
    );
  }

  return (
    <div className="relative w-full py-4 hidden sm:block">
      <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -translate-y-1/2 rounded-full" />
      <div
        className="absolute top-1/2 left-0 h-1 bg-stone-900 -translate-y-1/2 rounded-full transition-all duration-500"
        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
      />

      <div className="relative flex justify-between">
        {STEPS.map((step, index) => {
          const isCompleted = index <= currentStep;
          const isCurrent = index === currentStep;

          return (
            <div
              key={step}
              className="flex flex-col items-center gap-2 bg-white px-2"
            >
              <div
                className={`w-4 h-4 rounded-full border-2 transition-colors ${
                  isCompleted
                    ? "bg-stone-900 border-stone-900"
                    : "bg-white border-stone-200"
                }`}
              >
                {isCompleted && (
                  <CheckCircle className="w-full h-full text-white p-[1px]" />
                )}
              </div>
              <span
                className={`text-xs font-medium ${
                  isCurrent ? "text-stone-900" : "text-stone-400"
                }`}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
