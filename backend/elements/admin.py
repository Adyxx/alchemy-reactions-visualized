from django.contrib import admin
from .models import Element, Recipe, RecipeComponent

class RecipeComponentInline(admin.TabularInline):
    model = RecipeComponent
    extra = 2
    autocomplete_fields = ("element",)

@admin.register(Recipe)
class RecipeAdmin(admin.ModelAdmin):
    list_display = ("id", "result")
    autocomplete_fields = ("result",)
    inlines = [RecipeComponentInline]


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ("name", "symbol", "aspect", "cost", "updated_at")
    search_fields = ("name", "symbol", "description")
    list_filter = ("aspect", "updated_at")
    ordering = ("name",)