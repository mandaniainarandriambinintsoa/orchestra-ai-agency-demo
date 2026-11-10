import { StockWorkspace } from "@/components/stock-workspace";
import { PageHeader } from "@/components/ui/page-header";

export const metadata = { title: "Stock" };

export default function StockPage() {
  return (
    <section className="space-y-8">
      <PageHeader
        eyebrow="Boutique informatique"
        title="Gestion de stock"
        description="Ajoutez et modifiez des produits, archivez-les, puis enregistrez chaque entrée ou sortie. Les mouvements sont atomiques et l’application refuse un stock négatif."
      />
      <StockWorkspace />
    </section>
  );
}
