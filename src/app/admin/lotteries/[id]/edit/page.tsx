import { getLottery } from "@/app/actions";
import { UI } from "@/lib/i18n";
import { notFound } from "next/navigation";
import { LotteryForm } from "../../lottery-form";

export default async function EditLotteryPage({ params }: { params: { id: string } }) {
    const lottery = await getLottery(params.id);

    if (!lottery) {
        notFound();
    }

    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.EDIT_LOTTERY}</h1>
            <LotteryForm lottery={lottery} />
        </div>
    )
}
