from django.contrib import admin
from django.db.models import Prefetch

from .models import Element, Recipe, RecipeComponent

class RecipeComponentInline(admin.TabularInline):
    model = RecipeComponent
    extra = 2
    autocomplete_fields = ("element",)

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("id", "result", "ingredients")
    autocomplete_fields = ("result",)
    inlines = [RecipeComponentInline]

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        component_queryset = RecipeComponent.objects.select_related("element").order_by("id")
        return queryset.prefetch_related(Prefetch("components", queryset=component_queryset))

    @admin.display(description="Ingredients")
    def ingredients(self, obj):
        return " + ".join(component.element.name for component in obj.components.all()) or "-"


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ("name", "symbol", "aspect", "cost", "updated_at")
    search_fields = ("name", "symbol", "description")
    list_filter = ("aspect", "updated_at")
    ordering = ("name",)