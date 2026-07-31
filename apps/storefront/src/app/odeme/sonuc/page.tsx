import { Suspense } from "react";
import PaymentResultContent from "./PaymentResultContent";

export default function PaymentResultPage() {
    return (
        <Suspense fallback={null}>
            <PaymentResultContent />
        </Suspense>
    );
}
