import json
from pathlib import Path

from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils.text import slugify

from shop.models import Category, SneakerImage, Sneakers


class Command(BaseCommand):
    help = 'Seed sneakers, images and categories from fixtures/products.json'

    def add_arguments(self, parser):
        parser.add_argument(
            '--reset', action='store_true',
            help='Delete existing sneakers and categories before seeding',
        )

    @transaction.atomic
    def handle(self, *args, **options):
        fixture = Path(__file__).resolve().parents[2] / 'fixtures' / 'products.json'
        if not fixture.exists():
            self.stderr.write(self.style.ERROR(f'Fixture not found: {fixture}'))
            return

        if options['reset']:
            SneakerImage.objects.all().delete()
            Sneakers.objects.all().delete()
            Category.objects.all().delete()
            self.stdout.write(self.style.WARNING('Existing data cleared.'))

        with fixture.open() as f:
            products = json.load(f)

        cat_cache = {}
        created = 0

        for item in products:
            cat_name = (item.get('category') or '').strip()
            category = None
            if cat_name:
                if cat_name not in cat_cache:
                    cat, _ = Category.objects.get_or_create(
                        name=cat_name,
                        defaults={'slug': slugify(cat_name)},
                    )
                    cat_cache[cat_name] = cat
                category = cat_cache[cat_name]

            tag = item.get('tag') or 'regular'
            sneaker, was_created = Sneakers.objects.update_or_create(
                pk=item['id'],
                defaults={
                    'brand': item.get('brand', ''),
                    'title': item.get('title', ''),
                    'info': item.get('info', ''),
                    'category': category,
                    'final_price': item.get('finalPrice', 0),
                    'original_price': item.get('originalPrice', 0),
                    'ratings': item.get('ratings', 0),
                    'rate_count': item.get('rateCount', 0),
                    'tag': tag,
                    'tagline': item.get('tagline', '') or '',
                    'hero_image': item.get('heroImage', '') or '',
                    'stock': item.get('quantity', 0) or 10,
                },
            )

            SneakerImage.objects.filter(sneaker=sneaker).delete()
            for pos, url in enumerate(item.get('images', [])):
                SneakerImage.objects.create(sneaker=sneaker, url=url, position=pos)

            if was_created:
                created += 1

        self.stdout.write(self.style.SUCCESS(
            f'Seeded {len(products)} products ({created} new). Categories: {len(cat_cache)}.'
        ))
