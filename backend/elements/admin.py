from django.contrib import admin

from .models import Element, ElementComponent


class ElementComponentInline(admin.TabularInline):
    model = ElementComponent
    fk_name = "parent"
    extra = 1
    autocomplete_fields = ("component",)


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    inlines = [ElementComponentInline]
    list_display = ("name", "symbol", "aspect", "cost", "updated_at")
    search_fields = ("name", "symbol", "description")
    list_filter = ("aspect", "updated_at")
    ordering = ("name",)


@admin.register(ElementComponent)
class ElementComponentAdmin(admin.ModelAdmin):
    list_display = ("component", "parent")
    search_fields = ("component__name", "parent__name")