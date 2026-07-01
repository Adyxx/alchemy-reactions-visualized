from __future__ import annotations

from .models import Element, Recipe


def build_graph_payload():
    elements = Element.objects.all().order_by("name")

    nodes = [
        {
            "id": str(element.pk),
            "name": element.name,
            "symbol": element.symbol,
            "description": element.description,
            "cost": element.cost,
            "aspect": element.aspect,
        }
        for element in elements
    ]

    edges = []
    recipes = []

    queryset = Recipe.objects.prefetch_related("components__element").select_related("result")

    for recipe in queryset:
        result_id = str(recipe.result_id)
        component_ids = []

        for component in recipe.components.all():
            component_id = str(component.element_id)
            component_ids.append(component_id)
            edges.append(
                {
                    "id": f"{component.element_id}-{recipe.id}-{recipe.result_id}",
                    "source": component_id,
                    "target": result_id,
                    "recipeId": str(recipe.id),
                }
            )

        recipes.append(
            {
                "id": str(recipe.id),
                "resultId": result_id,
                "components": component_ids,
            }
        )

    return {"nodes": nodes, "edges": edges, "recipes": recipes}