import { IconArrowDown, IconArrowUp, IconBox, IconPackage, IconShoppingCart } from "@tabler/icons-react";
import { PageHeader } from "@/components/ui/page-header";

const products = [
  { sku: "INF-KEY-01", name: "Clavier mécanique Compact", stock: 18, threshold: 6, movement: "+8", status: "Disponible" },
  { sku: "INF-HDP-02", name: "Casque USB Pro", stock: 3, threshold: 5, movement: "-2", status: "Stock faible" },
  { sku: "INF-CAM-04", name: "Webcam Full HD", stock: 11, threshold: 4, movement: "+5", status: "Disponible" },
  { sku: "INF-HUB-03", name: "Hub USB-C 7 ports", stock: 0, threshold: 3, movement: "-1", status: "Rupture" },
];

export const metadata = { title: "Stock" };

export default function StockPage() {
  return (
    <section className="space-y-8">
      <PageHeader eyebrow="Boutique informatique démo" title="Gestion de stock" description="Catalogue, seuils et mouvements reliés au scénario conversationnel. Toutes les quantités sont fictives et isolées des autres projets." />
      <div className="grid gap-4 sm:grid-cols-3"><div className="surface p-5"><IconPackage className="text-sage-700" size={21} /><p className="mt-5 text-3xl font-medium">42</p><p className="mt-1 text-xs text-muted">Unités disponibles</p></div><div className="surface p-5"><IconBox className="text-amber-700" size={21} /><p className="mt-5 text-3xl font-medium">2</p><p className="mt-1 text-xs text-muted">Alertes actives</p></div><div className="surface p-5"><IconShoppingCart className="text-sage-700" size={21} /><p className="mt-5 text-3xl font-medium">7</p><p className="mt-1 text-xs text-muted">Mouvements aujourd’hui</p></div></div>
      <section className="surface overflow-hidden"><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left"><thead className="bg-[#fbfcf8] text-[10px] uppercase tracking-[.12em] text-muted"><tr><th className="px-5 py-3">Produit</th><th className="px-5 py-3">Disponible</th><th className="px-5 py-3">Seuil</th><th className="px-5 py-3">Dernier mouvement</th><th className="px-5 py-3">État</th></tr></thead><tbody className="divide-y divide-line">{products.map((product) => <tr key={product.sku}><td className="px-5 py-4"><p className="text-sm font-medium">{product.name}</p><p className="mt-1 text-[11px] text-muted">{product.sku}</p></td><td className="px-5 py-4 text-sm font-semibold tabular-nums">{product.stock}</td><td className="px-5 py-4 text-xs text-muted">{product.threshold}</td><td className="px-5 py-4"><span className={`inline-flex items-center gap-1 text-xs ${product.movement.startsWith("+") ? "text-emerald-700" : "text-rose-700"}`}>{product.movement.startsWith("+") ? <IconArrowUp size={14} /> : <IconArrowDown size={14} />}{product.movement}</span></td><td className="px-5 py-4"><span className={`text-xs font-semibold ${product.status === "Disponible" ? "text-emerald-700" : product.status === "Stock faible" ? "text-amber-700" : "text-rose-700"}`}>{product.status}</span></td></tr>)}</tbody></table></div></section>
      <section className="surface p-5 sm:p-7"><p className="eyebrow">Scénario contrôlé</p><h2 className="mt-3 text-xl font-medium">Une demande client devient une action stock.</h2><div className="mt-6 grid gap-3 text-xs text-muted md:grid-cols-4"><div className="rounded-xl bg-sage-50 p-4"><strong className="block text-ink">01 · Conversation</strong><p className="mt-2 leading-5">Le client demande deux casques USB.</p></div><div className="rounded-xl bg-sage-50 p-4"><strong className="block text-ink">02 · Vérification</strong><p className="mt-2 leading-5">Le stock disponible est interrogé côté serveur.</p></div><div className="rounded-xl bg-amber-50 p-4"><strong className="block text-amber-900">03 · Seuil franchi</strong><p className="mt-2 leading-5">La quantité restante passe sous le minimum.</p></div><div className="rounded-xl bg-sage-50 p-4"><strong className="block text-ink">04 · Notification</strong><p className="mt-2 leading-5">Une alerte interne est créée, sans envoi externe.</p></div></div></section>
    </section>
  );
}
