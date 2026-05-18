from django.contrib import admin

from .models import Category, Order, OrderItem, SneakerImage, Sneakers


class SneakerImageInline(admin.TabularInline):
    model = SneakerImage
    extra = 1


@admin.register(Sneakers)
class SneakersAdmin(admin.ModelAdmin):
    list_display = ('id', 'brand', 'title', 'category', 'final_price', 'tag', 'stock')
    list_filter = ('brand', 'category', 'tag')
    search_fields = ('brand', 'title', 'info')
    inlines = [SneakerImageInline]


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('id', 'name', 'slug')
    prepopulated_fields = {'slug': ('name',)}


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    readonly_fields = ('unit_price',)


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'total_amount', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__username', 'user__email')
    inlines = [OrderItemInline]
