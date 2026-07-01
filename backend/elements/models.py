from django.db import models


class Aspect(models.TextChoices):
    SPARK = "spark", "SPARK"
    SNOW = "snow", "SNOW"
    CRYSTAL = "crystal", "CRYSTAL"
    BLOOM = "bloom", "BLOOM"
    MOON = "moon", "MOON"
    NEUTRAL = "neutral", "NEUTRAL"


class Element(models.Model):
    name = models.CharField(max_length=120, unique=True)
    symbol = models.CharField(max_length=24, unique=True)
    description = models.TextField(blank=True)
    cost = models.PositiveIntegerField(default=0)
    aspect = models.CharField(
        max_length=24,
        choices=Aspect.choices,
        default=Aspect.SPARK,
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Recipe(models.Model):
    result = models.ForeignKey(
        Element,
        on_delete=models.CASCADE,
        related_name="recipes",
    )

    class Meta:
        ordering = ["result__name", "id"]

    def __str__(self):
        return f"Recipe for {self.result}"

class RecipeComponent(models.Model):
    recipe = models.ForeignKey(
        Recipe,
        on_delete=models.CASCADE,
        related_name="components",
    )

    element = models.ForeignKey(
        Element,
        on_delete=models.CASCADE,
        related_name="used_in_recipes",
    )

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=["recipe", "element"],
                name="unique_component_in_recipe",
            )
        ]

    def __str__(self):
        return f"{self.element} in {self.recipe}"