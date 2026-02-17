import { UI } from "@/lib/i18n";
import { ProductForm } from "../product-form";

export default function NewProductPage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-8">{UI.ADMIN.CREATE_PRODUCT}</h1>
            <ProductForm />
        </div>
    )
}
