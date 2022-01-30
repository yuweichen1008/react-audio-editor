from django.contrib import admin
from myapp.models import Snippet
# Register your models here.

@admin.register(Snippet)
class SnippetAdmin(admin.ModelAdmin):
    model = Snippet

