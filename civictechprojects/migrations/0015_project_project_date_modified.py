# -*- coding: utf-8 -*-
# Generated by Django 1.10.7 on 2018-08-22 15:26
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('civictechprojects', '0014_auto_20180806_1942'),
    ]

    operations = [
        migrations.AddField(
            model_name='project',
            name='project_date_modified',
            field=models.DateTimeField(auto_now=True, null=True),
        ),
    ]
