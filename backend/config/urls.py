"""URL configuration for the backend project."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from elements.models import Element, Recipe


def health(request):
    return JsonResponse({"status": "ok"})


def elements_graph(request):
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

    recipes = (
        Recipe.objects
        .prefetch_related("components__element")
        .select_related("result")
    )

    for recipe in recipes:
        result_id = str(recipe.result_id)

        for component in recipe.components.all():
            edges.append(
                {
                    "id": f"{component.element_id}-{recipe.id}-{recipe.result_id}",
                    "source": str(component.element_id),
                    "target": result_id,
                }
            )

    return JsonResponse({"nodes": nodes, "edges": edges})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("api/elements/", elements_graph),
]