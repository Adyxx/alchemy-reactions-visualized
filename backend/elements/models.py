from django.db import models


class Aspect(models.TextChoices):
    SPARK = "spark", "SPARK"
    SNOW = "snow", "SNOW"
    CRYSTAL = "crystal", "CRYSTAL"
    BLOOM = "bloom", "BLOOM"
    MOON = "moon", "MOON"


class Element(models.Model):
    name = models.CharField(max_length=120, unique=True)
    symbol = models.CharField(max_length=24, unique=True)
    description = models.TextField(blank=True)
    cost = models.PositiveIntegerField(default=0)
    aspect = models.CharField(max_length=24, choices=Aspect.choices, default=Aspect.SPARK)
    components = models.ManyToManyField(
        "self",
        through="ElementComponent",
        through_fields=("parent", "component"),
        symmetrical=False,
        related_name="composed_elements",
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self) -> str:
        return self.name


class ElementComponent(models.Model):
    parent = models.ForeignKey(Element, on_delete=models.CASCADE, related_name="component_links")
    component = models.ForeignKey(Element, on_delete=models.CASCADE, related_name="used_in_links")

    class Meta:
        ordering = ["parent__name", "component__name"]
        constraints = [
            models.UniqueConstraint(fields=["parent", "component"], name="unique_element_component_pair"),
        ]

    def __str__(self) -> str:
        return f"{self.component} -> {self.parent}"