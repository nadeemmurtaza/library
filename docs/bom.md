# Bill of materials (BOM)

Recipes for made-to-order products: what goes into one unit, what it costs, what to charge, and what to buy.

| Piece | Where |
| --- | --- |
| Costing maths (pure) | `utils/costing.js` — `costBom`, `margin`, `suggestPrice`, `explode`, `shoppingPlan`, `consumption` |
| Status helpers | `constants/materials.js` |
| Schemas | `schemas/material.schema.json`, `schemas/bom.schema.json` |
| Recipe editor | `components/patterns/bom-editor.js` — `mountBomEditor` |

## Model
- **Material**: name, unit, pack size, cost per pack, stock, reorder level.
- **Recipe (BOM)**: one per product; lines `{material, qty, waste%}` plus labour minutes.
- **Cost** = materials (qty × (1+waste) × unit cost) + labour (minutes × hourly rate) + overhead % of the sum.
- **Margin** is compared with a target; `suggestPrice` returns cost ÷ (1 − target).
- **Make list**: `explode` open orders into total material need; `shoppingPlan` subtracts stock and rounds up to whole packs.
- **Consumption**: when an order enters *preparing*, materials are deducted once (idempotent, lines stored on the order); *cancelled* restores exactly what was taken.

## Assumptions
All rates (labour, overhead, target margin) live in Settings. Seed recipes in the demo are estimates, not real costs.
