from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("elements", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="element",
            name="cost",
            field=models.PositiveIntegerField(default=0),
        ),
        migrations.AddField(
            model_name="element",
            name="aspect",
            field=models.CharField(
                choices=[
                    ("spark", "SPARK"),
                    ("snow", "SNOW"),
                    ("crystal", "CRYSTAL"),
                    ("bloom", "BLOOM"),
                    ("moon", "MOON"),
                ],
                default="spark",
                max_length=24,
            ),
        ),
        migrations.CreateModel(
            name="ElementComponent",
            fields=[
                (
                    "id",
                    models.BigAutoField(
                        auto_created=True, primary_key=True, serialize=False, verbose_name="ID"
                    ),
                ),
                (
                    "component",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="used_in_links",
                        to="elements.element",
                    ),
                ),
                (
                    "parent",
                    models.ForeignKey(
                        on_delete=models.deletion.CASCADE,
                        related_name="component_links",
                        to="elements.element",
                    ),
                ),
            ],
            options={
                "ordering": ["parent__name", "component__name"],
            },
        ),
        migrations.AddConstraint(
            model_name="elementcomponent",
            constraint=models.UniqueConstraint(
                fields=("parent", "component"), name="unique_element_component_pair"
            ),
        ),
        migrations.AddField(
            model_name="element",
            name="components",
            field=models.ManyToManyField(
                blank=True,
                related_name="composed_elements",
                through="elements.ElementComponent",
                through_fields=("parent", "component"),
                to="elements.element",
            ),
        ),
    ]
