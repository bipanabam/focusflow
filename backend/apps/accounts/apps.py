from django.apps import AppConfig

class AccountsConfig(AppConfig):
    name = 'apps.accounts'
    label = 'accounts'
    
    def ready(self):
        # This import registers the CookiesJWTScheme when Django starts
        print("Ready method executed!")
        import apps.accounts.authentication
