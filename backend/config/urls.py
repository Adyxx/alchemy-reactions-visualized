"""URL configuration for the backend project."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from elements.models import Element


def health(request):
    return JsonResponse({"status": "ok"})


def elements_graph(request):
    elements = Element.objects.prefetch_related("components").order_by("name")
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
    for element in elements:
        for component in element.components.all():
            edges.append(
                {
                    "id": f"{component.pk}-{element.pk}",
                    "source": str(component.pk),
                    "target": str(element.pk),
                }
            )
    return JsonResponse({"nodes": nodes, "edges": edges})


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("api/elements/", elements_graph),
]