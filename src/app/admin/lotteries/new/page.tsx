import { UI } from "@/lib/i18n";
import { LotteryForm } from "../lottery-form";

export default function NewLotteryPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.CREATE_LOTTERY}</h1>
            <LotteryForm />
        </div>
    )
}
