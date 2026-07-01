"""URL configuration for the backend project."""

from django.contrib import admin
from django.http import JsonResponse
from django.urls import path

from elements.graph_data import build_graph_payload


def health(request):
    return JsonResponse({"status": "ok"})


def elements_graph(request):
    return JsonResponse(build_graph_payload())


urlpatterns = [
    path("admin/", admin.site.urls),
    path("health/", health),
    path("api/elements/", elements_graph),
]