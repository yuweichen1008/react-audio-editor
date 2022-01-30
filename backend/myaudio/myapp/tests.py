from django.test import TestCase
from myapp.models import Snippet

# Create your tests here.

class SnippetTestCase(TestCase):
    def setUp(self):
        Snippet.objects.create(code='foo = "bar"\n')

    def test_snippet(self):
        # Snippet.objects.get(name=)
        self.assertEqual(1,1)