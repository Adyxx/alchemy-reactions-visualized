from django.db import models


class Element(models.Model):
    name = models.CharField(max_length=120, unique=True)
    symbol = models.CharField(max_length=24, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name