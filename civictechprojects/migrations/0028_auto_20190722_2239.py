# -*- coding: utf-8 -*-
# Generated by Django 1.11.20 on 2019-07-22 22:39
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('civictechprojects', '0027_auto_20190717_1947'),
    ]

    operations = [
        migrations.AlterField(
            model_name='projectfile',
            name='file_name',
            field=models.CharField(max_length=150),
        ),
    ]
