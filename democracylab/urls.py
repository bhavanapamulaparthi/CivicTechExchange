"""democracylab URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf.urls import include, url
from django.contrib import admin
from django.contrib.auth import views as auth_views
from django.views.generic.base import RedirectView
from common.helpers.error_handlers import handle500

from . import views

# Set custom error handler
handler500 = handle500

urlpatterns = [
    url(r'^accounts/', include('oauth2.providers.github.urls')),
    url(r'^accounts/', include('oauth2.providers.google.urls')),
    url(r'^accounts/', include('oauth2.providers.linkedin.urls')),
    url(r'^accounts/', include('oauth2.providers.facebook.urls')),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^signup/$', views.signup, name='signup'),
    url(r'^login/$', views.login_view, name='login_view'),
    url(r'^login/(?P<provider>\w+)', views.login_view, name='login_view'),
    url(r'^logout/$', auth_views.logout, {'next_page': '/'}, name='logout'),
    url(
        r'^password_reset/$',
        views.password_reset,
        name="password_reset",
    ),
    url(
        r'^change_password/$',
        views.change_password,
        name="change_password",
    ),
    url(
        r'^verify_user/(?P<user_id>[0-9]+)/(?P<token>[0-9a-z\-]+)$',
        views.verify_user,
        name="verify_user"
    ),
    url(
        r'^verify_user/$',
        views.send_verification_email_request,
        name="send_verification_email_request"
    ),
    url(r'^api/user/(?P<user_id>[0-9]+)/$', views.user_details, name='user_details'),
    url(r'^api/user/edit/(?P<user_id>[0-9]+)/$', views.user_edit, name='user_edit'),
    url(r'^', include('civictechprojects.urls')),
    url(r'^$', RedirectView.as_view(url='/index/?section=Home', permanent=False)),
    url(r'^admin/', admin.site.urls),
    url(r'^platform$', RedirectView.as_view(url='http://connect.democracylab.org/platform/', permanent=False)),
    # url(r'^.*$', RedirectView.as_view(url='/index/', permanent=False))
]
