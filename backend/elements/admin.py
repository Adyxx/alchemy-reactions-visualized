from django.contrib import admin

from .models import Element


@admin.register(Element)
class ElementAdmin(admin.ModelAdmin):
    list_display = ("name", "symbol", "updated_at")
    search_fields = ("name", "symbol", "description")
    list_filter = ("updated_at",)
    ordering = ("name",)