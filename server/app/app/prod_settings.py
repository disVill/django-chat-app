import dj_database_url

from .settings import *


DEBUG = False

# Database settings
DATABASES = {
    'default': dj_database_url.config()
}


# Static files settings

STATIC_ROOT = os.path.join(BASE_DIR, 'static/')
STATICFILES_DIRS = (
    ('css', os.path.join(STATIC_ROOT, 'css')),
    ('img', os.path.join(STATIC_ROOT, 'img')),
    ('js', os.path.join(STATIC_ROOT, 'js')),
    ('html', os.path.join(STATIC_ROOT, 'html')),
)


# Logging settings

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'WARNING',
    },
}
