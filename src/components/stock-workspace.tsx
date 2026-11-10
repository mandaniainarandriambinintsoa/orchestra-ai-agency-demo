"use client";

import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import { IconArchive, IconBox, IconMinus, IconPackage, IconPlus, IconRefresh } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";

type Product = {
  id: number; sku: string; name: string; description: string | null;
  quantity_available: number; minimum_stock: number; unit_price: number | null;
};
const inputClass = "min-h-11 w-full rounded-[10px] border border-line bg-white px-3 text-sm outline-none focus:border-sage-600";

export function StockWorkspace() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [pending, setPending] = useState<string | null>(null);
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    try {
      const response = await fetch("/api/products", { cache: "no-store" });
      const payload = (await response.json()) as { data?: Product[] };
      if (!response.ok) throw new Error();
      setProducts(payload.data ?? []);
    } catch {
      setNotice("Impossible de charger le stock.");
    }
  }, []);
  useEffect(() => {
    let cancelled = false;
    fetch("/api/products", { cache: "no-store" })
      .then(async (response) => {
        const payload = (await response.json()) as { data?: Product[] };
        if (!response.ok) throw new Error();
        return payload.data ?? [];
      })
      .then((data) => { if (!cancelled) setProducts(data); })
      .catch(() => { if (!cancelled) setNotice("Impossible de charger le stock."); });
    return () => { cancelled = true; };
  }, []);

  const totals = useMemo(() => ({
    units: products.reduce((sum, product) => sum + product.quantity_available, 0),
    alerts: products.filter((product) => product.quantity_available <= product.minimum_stock).length,
  }), [products]);

  async function create(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setPending("create");
    const form = new FormData(formElement);
    try {
      const response = await fetch("/api/products", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: form.get("sku"), name: form.get("name"), description: form.get("description"),
          quantity: form.get("quantity"), minimumStock: form.get("minimumStock"), unitPrice: form.get("unitPrice") || undefined,
        }),
      });
      if (!response.ok) throw new Error("Ajout impossible. Vérifiez le SKU.");
      formElement.reset();
      setShowForm(false);
      setNotice("Produit ajouté.");
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Ajout impossible.");
    } finally {
      setPending(null);
    }
  }

  async function adjust(product: Product, delta: number) {
    const reason = window.prompt(delta > 0 ? "Motif de l’entrée en stock :" : "Motif de la sortie de stock :", delta > 0 ? "Réapprovisionnement" : "Vente");
    if (!reason) return;
    setPending(`adjust-${product.id}`);
    try {
      const response = await fetch(`/api/products/${product.id}/adjust`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta, reason }),
      });
      if (!response.ok) throw new Error(delta < 0 ? "Stock insuffisant ou produit indisponible." : "Mouvement impossible.");
      setNotice(`Stock de « ${product.name} » mis à jour.`);
      await load();
    } catch (error) {
      setNotice(error instanceof Error ? error.message : "Mouvement impossible.");
    } finally {
      setPending(null);
    }
  }

  async function archive(product: Product) {
    if (!window.confirm(`Archiver « ${product.name} » ? Son historique sera conservé.`)) return;
    setPending(`archive-${product.id}`);
    try {
      const response = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
      if (!response.ok) throw new Error();
      setNotice("Produit archivé.");
      await load();
    } catch {
      setNotice("Archivage impossible.");
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="surface p-5"><IconPackage className="text-sage-700" size={21} /><p className="mt-5 text-3xl font-medium">{totals.units}</p><p className="mt-1 text-xs text-muted">Unités disponibles</p></div>
        <div className="surface p-5"><IconBox className="text-amber-700" size={21} /><p className="mt-5 text-3xl font-medium">{totals.alerts}</p><p className="mt-1 text-xs text-muted">Produits au seuil ou en rupture</p></div>
      </div>

      <div className="flex flex-wrap justify-end gap-3">
        <Button variant="secondary" onClick={() => void load()}><IconRefresh size={17} />Actualiser</Button>
        <Button onClick={() => setShowForm((value) => !value)}><IconPlus size={17} />Ajouter un produit</Button>
      </div>
      {notice ? <p className="rounded-xl border border-sage-200 bg-sage-50 px-4 py-3 text-sm text-sage-800" role="status">{notice}</p> : null}

      {showForm ? (
        <form onSubmit={create} className="surface grid gap-4 p-5 md:grid-cols-3">
          <label className="text-xs font-semibold">SKU<input name="sku" required minLength={2} maxLength={80} className={`${inputClass} mt-2`} placeholder="INF-MOU-05" /></label>
          <label className="text-xs font-semibold md:col-span-2">Nom<input name="name" required minLength={2} maxLength={180} className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold">Quantité initiale<input name="quantity" required type="number" min={0} max={1000000} defaultValue={0} className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold">Seuil minimum<input name="minimumStock" required type="number" min={0} max={1000000} defaultValue={2} className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold">Prix unitaire (€)<input name="unitPrice" type="number" min={0} step="0.01" className={`${inputClass} mt-2`} /></label>
          <label className="text-xs font-semibold md:col-span-3">Description<input name="description" maxLength={1000} className={`${inputClass} mt-2`} /></label>
          <div className="md:col-span-3 flex justify-end"><Button disabled={pending === "create"}>Enregistrer</Button></div>
        </form>
      ) : null}

      <section className="surface overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-[#fbfcf8] text-[10px] uppercase tracking-[.12em] text-muted"><tr><th className="px-5 py-3">Produit</th><th className="px-5 py-3">Disponible</th><th className="px-5 py-3">Seuil</th><th className="px-5 py-3">État</th><th className="px-5 py-3 text-right">Actions</th></tr></thead>
            <tbody className="divide-y divide-line">
              {products.map((product) => {
                const isLow = product.quantity_available <= product.minimum_stock;
                return (
                  <tr key={product.id}>
                    <td className="px-5 py-4"><p className="text-sm font-medium">{product.name}</p><p className="mt-1 text-[11px] text-muted">{product.sku}{product.unit_price !== null ? ` · ${Number(product.unit_price).toFixed(2)} €` : ""}</p></td>
                    <td className="px-5 py-4 text-lg font-semibold tabular-nums">{product.quantity_available}</td>
                    <td className="px-5 py-4 text-xs text-muted">{product.minimum_stock}</td>
                    <td className={`px-5 py-4 text-xs font-semibold ${isLow ? "text-amber-700" : "text-emerald-700"}`}>{product.quantity_available === 0 ? "Rupture" : isLow ? "Stock faible" : "Disponible"}</td>
                    <td className="px-5 py-4"><div className="flex justify-end gap-2"><Button size="small" variant="secondary" onClick={() => void adjust(product, -1)} disabled={pending !== null || product.quantity_available === 0} aria-label={`Retirer une unité de ${product.name}`}><IconMinus size={15} /></Button><Button size="small" variant="secondary" onClick={() => void adjust(product, 1)} disabled={pending !== null} aria-label={`Ajouter une unité à ${product.name}`}><IconPlus size={15} /></Button><Button size="small" variant="ghost" onClick={() => void archive(product)} disabled={pending !== null} aria-label={`Archiver ${product.name}`}><IconArchive size={15} /></Button></div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
